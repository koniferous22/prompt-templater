# `README.md`

`prompt-templater` is a proof-of-concept CLI template rendering util, that prefills clipboard with rendered contents. This is useful for having accessible large chunks of text that need relatively few customizations, in relatively few keystrokes. Simply think of the use-case as set of customizable shortcuts ready to paste, instead of typing words.

- [How it works?](#how-it-works)
- [How to setup?](#how-to-setup)
- [Motivation](#motivation)
- [Feature support](#feature-support)
- [Roadmap](#roadmap)
- [Anyways...](#anyways)

## How it works?

![./resources/gif/readme--01-how-it-works--01-basic-use-1280.gif](./resources/gif/readme--01-how-it-works--01-basic-use-1280.gif)

After running the command, you should automatically have following contents in your clipboard

![./resources/png/readme--01-how-it-works--01-clipboard-contents.png](./resources/png/readme--01-how-it-works--01-clipboard-contents.png)

### `prompt-templater` under the hood

`prompt-templater` works by connecting [`handlebars`](https://handlebarsjs.com/) templates with concept of workflows. Workflows are simple CLI programs / series of prompts generated from JSON / YAML config files, on top of [`inquirer` library](https://www.npmjs.com/package/inquirer). These prompts populate variables rendered by `handlebars` template.

For following command

```sh
./bin/prompt-templater -w "$PWD/fixtures/unit-test-workspace" workflows/test-workflow.yml
```

example template (available [here](./fixtures/unit-test-workspace/templates/test-template-basic.hbs))

```hbs
passed value from workflow: {{selectStep}}
```

along with example workflow (available [here](./fixtures/unit-test-workspace/workflows/test-workflow.yml))

```yaml
# Workflow file references template
# path can be relative, assuming both workflow and template are located in same workspace
templateFile: templates/test-template-basic.hbs
steps:
  - type: select
    # Defines variable name `selectStep`, that will contain picked value out of `literalValue1..3`
    id: selectStep
    message: pick an option
    valueType: string
    choices:
      type: literal
      values:
        - literalValue1
        - literalValue2
        - literalValue3
```

### Practical recommendations to make this an efficient tool

or if you want to try setting it up right away, skip to ["setup guide"](#how-to-setup)

#### recommendation \#1 - [`fzf`](https://github.com/junegunn/fzf)

Since workflow is the sole entrypoint of `prompt-templater`, that also references template to render, clearly you don't want to type workflow everytime you want to run this. [`fzf`](https://github.com/junegunn/fzf) fuzzy finder is a good tool for picking workflow to run.

You can assemble a simple workflow picker

![./resources/gif/readme--01-how-it-works--02-fzf-recommendation-1280.gif](./resources/gif/readme--01-how-it-works--02-fzf-recommendation-1280.gif)

using following snippet

```sh
# Check if executables on which bash function depends are present
function check_dependencies() {
  if ! which "find"; then
    echo "\"find\" dependency not found, install via your package manager" >&2
    return 1
  fi
  if ! which "fzf"; then
    echo "\"fzf\" dependency not found, install via your package manager" >&2
    return 1
  fi
  if ! which "sed"; then
    echo "\"sed\" dependency not found, install via your package manager" >&2
    return 1
  fi
}

check_dependencies
# Generic util
# 1st argument = workspace - root path from which workflows are searched
# rest arguments = CLI options passed to `prompt-templater`
function prompt_templater_run_workflow_in_workspace() {
  local prompt_templater_workspace="$1"
  if [[ ! -d $prompt_templater_workspace ]]; then
    echo "path to workspace \"$prompt_templater_workspace\" is not a directory" >&2
    return 1
  fi
  shift 1
  local absolute_starting_point_path
  local fzf_output
  absolute_starting_point_path="$(realpath "$prompt_templater_workspace")"
  fzf_output="$(find "$absolute_starting_point_path/workflows" -type f -printf "%p\n"  | sed "s|${absolute_starting_point_path}/||" | fzf)"
  local fzf_result=$?
  if [[ $fzf_result != 0 ]]; then
    echo "fzf status code $fzf_result" >&2
    return 1
  fi
  if [[ ! $fzf_output ]]; then
    echo "no file selected" >&2
    return 0
  fi
  # Requires `prompt-templater` to be present in $PATH
  prompt-templater -w "$prompt_templater_workspace" "$@" "$fzf_output"
}

# Specific util to run `prompt-templater` without any additional CLI flags
function prompt_templater_run() {
  local prompt_templater_workspace="$1"
  if [[ ! -d $prompt_templater_workspace ]]; then
    echo "path to workspace \"$prompt_templater_workspace\" is not a directory" >&2
    return 1
  fi
  prompt_templater_run_workflow_in_workspace "$prompt_templater_workspace"
}
```

and test with following one-liner in root folder of cloned repository

```sh
# To resolve `prompt-templater` executable path
PATH="$PATH:$PWD/bin"
prompt_templater_run "$PWD/fixtures/unit-test-workspace"
```

#### recommendation \#2 - shell alias

[`alias`](https://en.wikipedia.org/wiki/Alias_%28command%29) is strongly recommended as well; for example

![./resources/gif/readme--01-how-it-works--03-alias-recommendation-1280.gif](./resources/gif/readme--01-how-it-works--03-alias-recommendation-1280.gif)

using following snippet

```sh
# as for "Prompt TeMPlater Test" (uppercase denoting shortcut letters)
alias ptmpt="prompt_templater_run \"\$PWD/fixtures/unit-test-workspace\""
```

Motivation for using `alias` is ease of workspace switching rather than typing speed. As you could see in previous examples

```sh
# workspace passed as `-w` argument
prompt-templater -w "$prompt_templater_workspace" "$@" "$fzf_output"
```

Workspaces are passed as `-w` argument to `prompt-templater` executable. Workspace option `-w` is a required option. Furthermore each template and workflow belongs under a workspace.

Workspaces are are folders with following structure

```txt
.
├── templates
├── terms
└── workflows

4 directories
```

Workspace folders are considered resource containers from which resources (workflows, templates + potentially more) can be identified using relative path.

![./resources/png/readme--01-how-it-works--02-relative-resource-paths-in-workspace.png](./resources/png/readme--01-how-it-works--02-relative-resource-paths-in-workspace.png)

command to create workspace = TBD

For now a simple `mkdir` will suffice, as there are no further restriction on workspace, other than expecting mentioned subfolders

```sh
mkdir templates terms workflows
```

or

```sh
mkdir -p workspace/templates workspace/terms workspace/workflows
```

Organization of workspaces is subject to user decisions; workspaces can be containers per-project, or containers per-use-case, whether it's for `bash` snippets that you didn't have time to put together into maintained functionality / viable scripts,, but you need to keep it somewhere as a workaround, or for prompt crafting, for whatever is not skillified in your project using `AGENTS.md` for some reason

### Use with AI

The obvious use-case for `prompt-templater` is LLM prompt crafting, which is the main motivation why this utility came to existence in the first place.

Procedural thinking in codebases is largely achieved using LLM Skills, however `/skillify`-ing sessions / defining skill doesn't really fill the gap towards one-shotting UX with LLMs. Use of skills still requires articulating a lot of supplementary prompt text. Fuzzy finder with a few keypresses, gets closer to the almost-deterministic feel of getting things done with AI.

## How to setup?

<span style="color: #FFD700;">⚠️</span> Heavy PoC - naturally untested outside of my Linux workstation

### Dependencies

- [`bun`](https://bun.sh/)
- [`fzf`](https://github.com/junegunn/fzf) (recommended)

### 1. `git clone`

```sh
# Check if executables on which bash function depends are present
function check_dependencies() {
  if ! which "bun"; then
    echo "\"bun\" dependency not found, install" >&2
    return 1
  fi
  if ! which "find"; then
    echo "\"find\" dependency not found, install via your package manager" >&2
    return 1
  fi
  if ! which "fzf"; then
    echo "\"fzf\" dependency not found, install via your package manager" >&2
    return 1
  fi
  if ! which "sed"; then
    echo "\"sed\" dependency not found, install via your package manager" >&2
    return 1
  fi
}

function setup() {
  # Check deps and fail if there's a dependency missing
  check_dependencies || return $?
  git clone "https://codeberg.org/koniferous22/prompt-templater.git"
}

setup
```

### 2. Configure shell utils

Define `prompt-templater` related functions in your `.bashrc` / `.zshrc`

Note for `nushell` users - sadly didn't have time to write `nushell` equivalent :(

```sh
# Generic util
# 1st argument = workspace - root path from which workflows are searched
# rest arguments = CLI options passed to `prompt-templater`
function prompt_templater_run_workflow_in_workspace() {
  local prompt_templater_workspace="$1"
  if [[ ! -d $prompt_templater_workspace ]]; then
    echo "path to workspace \"$prompt_templater_workspace\" is not a directory" >&2
    return 1
  fi
  shift 1
  local absolute_starting_point_path
  local fzf_output
  absolute_starting_point_path="$(realpath "$prompt_templater_workspace")"
  fzf_output="$(find "$absolute_starting_point_path/workflows" -type f -printf "%p\n"  | sed "s|${absolute_starting_point_path}/||" | fzf)"
  local fzf_result=$?
  if [[ $fzf_result != 0 ]]; then
    echo "fzf status code $fzf_result" >&2
    return 1
  fi
  if [[ ! $fzf_output ]]; then
    echo "no file selected" >&2
    return 0
  fi
  # Requires `prompt-templater` to be present in $PATH
  prompt-templater -w "$prompt_templater_workspace" "$@" "$fzf_output"
}

# Specific util to run `prompt-templater` without any additional CLI flags
function prompt_templater_run() {
  local prompt_templater_workspace="$1"
  if [[ ! -d $prompt_templater_workspace ]]; then
    echo "path to workspace \"$prompt_templater_workspace\" is not a directory" >&2
    return 1
  fi
  prompt_templater_run_workflow_in_workspace "$prompt_templater_workspace"
}

# Runs `prompt-templater` with additional "-u" flag
function prompt_templater_run_unsafe() {
  local prompt_templater_workspace="$1"
  if [[ ! -d $prompt_templater_workspace ]]; then
    echo "path to workspace \"$prompt_templater_workspace\" is not a directory" >&2
    return 1
  fi
  prompt_templater_run_workflow_in_workspace "$prompt_templater_workspace" "-u"
}
```

### 3. Create workspaces in your FS

```sh
mkdir templates terms workflows
```

or

```sh
# ⚠️ make sure to reconfigure
mkdir -p /my/path/to/prompt-templater/workspace1/templates /my/path/to/prompt-templater/workspace1/terms /my/path/to/prompt-templater/workspace1/workflows
```

### 4. Define workspace env variables and `alias`es

#### workspace env variables

<span style="color: #FFD700;">⚠️</span> make sure to reconfigure

```sh
# either `~/.bash_profile`, or `.zshenv
# ⚠️ make sure to reconfigure
PROMPT_TEMPLATER_WORKSPACE1=/my/path/to/prompt-templater/workspace1
# ⚠️ make sure to reconfigure
PROMPT_TEMPLATER_WORKSPACE2=/my/path/to/prompt-templater/workspace2
```

#### `alias`es

```sh
# either `~/.bashrc`, or `.zshrc
ptmpw1="prompt_templater_run \"\$PROMPT_TEMPLATER_WORKSPACE1\""
ptmpw2="prompt_templater_run \"\$PROMPT_TEMPLATER_WORKSPACE2\""
# unsafe variants
ptmpwu1="prompt_templater_run_unsafe \"\$PROMPT_TEMPLATER_WORKSPACE1\""
ptmpwu2="prompt_templater_run_unsafe \"\$PROMPT_TEMPLATER_WORKSPACE2\""
```

## Motivation

[(skip to shorter version)](#shorter-version)

### Longer version (goes a off tangent, so naturally don't read it, unless you have no other choice)

`prompt-templater` at the present moment can assist in few use cases with respect to AI, due to being in proof-of-concept stage. The usefulness is limited namely through limited workflow syntax, hopefully [it gets better soon](#roadmap). Neverthless AI is the primary motivation for this project, especially the area of orchestrating complex tasks with reliable outcomes. Tasks with desired outcome should have short, or preferably no [agentic loop](https://en.wikipedia.org/wiki/AI_agent)s. I've put together a few reasons why, however don't expect me to lead hour-long debates defending the reasons. Or in case you do expect me to defend stated reasons for some reason, don't expect prompt responses on stated topics, as I got shit to do.

#### Reason \#1 - Risk of poor outcomes of agentic detours, or in worse case improvisation (⚠ text in this section contains bias, and if that weren't enough, it also contains AI pessimist ramblings; naturally read only at your own risk, you've been warned)

The AI output often feels like random noise. Obviously LLMs work smoothly when the model has received finetuned nuanced instructions how AI should approach the stated objective, that the user has expressed in session. This is assumed to work regardless if the approach has been expressed through careful prompt crafting, or genererated skill through plugins, such as [`skill-creator`](https://www.skills.sh/anthropics/skills/skill-creator), etc. Unless this additional context is specified, often you end up rolling the dice (metaphorically) with respect to the outcomes and whether they actually match the desired criteria.

Statistically yes, the outcome of agentic loops is whatever user specified. However the true issue becomes scale, with amount of concepts that should be expressed for the LLM to take into input context. Further question is, how large the input context window is expected to grow, given so many things are expressed. It is area where keyboard macros could be helpful, at very least I see personal benefit in not having to remember all the nuances and workarounds, not having to go through mental process of explaining myself to a stochastic parrot, unless of course it's acceptable to achieve results through 30 minute therapeutic sessions with stochastic parrots, where user adopts the role of therapist. If the reader is up for that, I'm not even sure what's the purpose of reading until this point.

Sadly, it's not reasonable to pollute software projects by serializing every single reasoning for every single micro-designed choice in markdown files. It is obviously feasible, as markdown syntax and sufficient storage naturally allows expressing every single reasoning. However even if you were to accomplish such feat of expressing everything, the reason, why you shouldn't delve into such excessive expression, is that "over-skillifying" hijacks the purpose of software projects from creating a product that works by running specified source code, to constructing knowledge base for justifying every single design choice to a stochastic parrot. At very least such endeavors should exist outside of project scope, in case the endeavor of expressing everything were to become messy.

Further argument against "over-skillifying" would be, that on the very first architectural refactor, the project developer might have to get rid of all the micro-detailed markdown descriptions. This would happen regardless if the micro-detailed markdown descriptions were generated by LLM, or finetuned by disclosing every single trail of thought in the markdown file. Origin doesn't really matter, because at the end of the day the produced code matters more than methodologies how the resulting code came to existence. Therefore it doesn't make sense to invest obsessive amount of time into articulating agentic instructions.

Agentic loops furthermore rely on skill trigger mechanism, specified in [markdown frontmatter](https://agentskills.io/specification#frontmatter), which is great for isolated predictable tasks. For instance a skill for managing a text document. To give another example applicable to codebases - a skill for enforcing conventions on top of "validators", or any other predictable concepts within codebase. Such skills are expected to instruct the model to follow a certain convention of how validators are constructed, organized and used throughout the codebase. Such skill are also easy to detect, by agentic loops, as model tends to know what's a validator, assuming it's properly defined.

Skills and their trigger mechanisms allow directly invoked skills or agentically invoked skills to be useful, by simply requiring just vague task description. Neverthless the applicability of skills and skill trigger mechanisms is restricted, especially when they run into cascade of potential side-effects and naive preassumptions of large language models, that concepts contained within input tokens that we send to LLM operate in isolation from each other.

To give a concrete example, let's say that in context of a monolithic codebase, you have deeply nested service, that 50 other services depend on. You want to perform a change through a carefully typed prompt, that articulates refactoring task for the agent to take care of. I believe this to be realistic and not-so-controversial scenario, assuming the reader has worked on larger software projects, that undergo scaling. In order to truly complete the aspect of work, that a human is liable for, the agentic loop should consider everything that depends on the edited service. To get specific it should regressively validate the change for each solution component that depends on the edited service. To understand what that means, it should validate, whether downstream change occurs in services, that depend on impacted service. It should also validate endpoint exposed in APIs, that depend on changes in affected service. To be even more extreme, from full-stack engineering perspective, change validation should take into account the downstream UI that consumes the APIs, whose underlying functionality has been impacted. Maybe in the most autistically extreme scenario imaginable, even users should be consulted.

Naturally there are many things to cover in example of such cascade of effects. Firstly if we delegate tasks of such nature to model, then the model should be able enumerate all the potential invocations / entrypoints, that have been impacted, where the end user can interact. This should include both plain API calls through postman and webapp user interface, assuming we're looking at this from classic full-stack engineering perspective. Afterwards, for each potential invocation the change should be validated in sterile environment, such as running E2E tests, or browser automation for apps depending on impacted API. Afterwards, the version should be deployed to real-world testing environment resembling production, where each potential user interaction is validated.

The trival reductionism of agentic loop, rarely adresses avalanche-like cascade of side-effects without missing a detail, or succeeding in understanding the true nature of task despite vague description provided. Expressing all of the mentioned constraints along with SDLC (software development lifecycle) is tedious. And while many isolated tasks are trivial to express, such as how to deploy, how to run tests, the true limiting factor within engineering is the agentic understanding of results on which next iteration of agentic loop depends on. The true limiting factor is cognitive interpretation of underlying subproblem correctness hidden in nuances. Too much metadata is required for agents to interpret this recursive piece of puzzle correctly. If agent can correctly validate correctness of solved subproblem observed from modified work, then the agent can inductively move on, to take a view on field from lens of higher problem and continue its work.

As a result I believe, the state of agents understanding every microdetail is a utopia, rather than state that is realistically reachable. It's not really viable to express every single human decision of how to interpret every single detail. And if it is possible, then maintaining such cognitive quasi-legal framework for agents to follow becomes a chore. Surely you can generate such framework with AI, but that misses the point and simply falls back to trap of AI generating rules of how it's going to act in future, and absent of proper steering, naturally it's going to resort to agentic detours, bugs, or poor design choices.

If you go the "over-skillifying" route, at some point the core focus of software projects becomes expressing of large dialogue trees / decision trees that serialize for agents how to interpret microdetails. And even if such cognitive markdown frameworks were possible to maintain, clearly there are issues applying it on virtually any collaborative projects, due to natural difficulties of human consensus. Human consensus is a dialectic process and sadly there are situations, where product development / maintenance, cannot be hijacked by excessive negotiations. Either "over-skillying" is mandated in autocratic manner, or it results in pointless discussion about nuances of agent reactive behaviour in autonomous agent loops, rather than actually developing software and useful features for human beings.

As a consequence, engineers have developed tendency of resorting to complacency and vague task specifications, where agentic detours become the new norm, rather than preserving culture of nuance and understanding specific domain details. Not only are detours a poor accountability standard, vagueness is also a [slippery slope](https://en.wikipedia.org/wiki/Slippery_slope), especially in context of scale, because codebase icebergs go deep. It seems that it is bound to happen realistically every time, that responsible people give up in middle of aspirations of understanding context, and fully delegate the task to agentic improvisation. There's also no shortage of codebase icebergs, whose details stop working correctly due to errors in nuances. Due to trends since dawn of AI, such as vibe-coding, which makes it sufficiently easy for average human to generate an iceberg, it's safe to say that bundled fault-ridden shit-code complexities of codebases aren't going anywhere.

If you resort to vagueness, which is the default acceptance mode of LLM users, you risk detours. Detours naturally suck ass UX-wise, beucase you have to quickly cognitively re-adapt, for articulating further instructions for large language model to remove the next obstacle in line.

Overall, it results in a strange paradox, that agentic loop is supposed to be reactive in the sense, that you throw pre-trained agent into environment, where the agent registers, interprets, understands and eventually acts within the environment. Assuming the agent is capable of registering, interpreting and understanding, the agents continues the lifecycle loop, until the agent evaluates that the stated objective is completed. A beautiful theory, however often it ends up being the exact opposite, that the human who delegated task to AI agent is actually the one subjected to the human loop, where the human loop is process of iterative readjusting of the agent to retry task completion, but this time properly, with actually desired outcome. It's a strange world where nuances of human craft have been thrown away, so that you can get things done by being subjected to interacting with a clanker.

While LLMs are great from perspective of metrics, such as accuracy, or whatever the fuck do AI companies consider their primary driver metric of their [pre-training and training procedures](https://en.wikipedia.org/wiki/Training_of_large_language_models#Pretraining). I find large-language models poor guarantee of stability to regularly rely on, compared to discrete concepts, that operate on 1s and 0s - i.e. compilers, operating systems, math, logic, scientific reasoning etc.

Random noise is a feature, not a bug, otherwise AI companies wouldn't have to transparently put out following statements.

[![./resources/png/readme--03-motivation--01-openai-terms-of-use-accuracy.png](./resources/png/readme--03-motivation--01-openai-terms-of-use-accuracy.png)](https://openai.com/policies/terms-of-use/)

The notion of acceptable entropy is an axiom of [machine learning](https://en.wikipedia.org/wiki/Machine_learning) as a research field. Consequentially, any company in the machine learning field, will engage in two-faced behaviour - [hyperstitioning](https://en.wikipedia.org/wiki/Hyperstition) singularity, while at the same time distancing themselves from accountability of model output.

To continue on AI-pessimist note, interacting with AI, 90% of time feels ok without issue. However then there are the remaining outlier cases, where the interaction causes frustration, or potentially visible human cortisol spikes. Such interaction outcomes sadly keep our understanding, or at very least my personal understanding of artificial intelligence as a tool shrouded by its unpredictability. On personal level, AI just reminds me of old-school engineering terms such as [GIGO](https://en.wikipedia.org/wiki/Garbage_in,_garbage_out) (Garbage-in garbage-out), which is a nice phrase for programs producing unusable output, except the end user is obviously not the one providing the shitty input.

But above all else, building things solely through agentic improvisation, while interactive aspect of human experience gets flatlined is simply not fun, I would even argue that it's the exact opposite; it's just annoying. Obviously I'm not against LLM inferrence, however I would suggest, that drawbacks from excessive reliance on LLMs, such as losing touch with technique of how to get things done from details to abstraction, excessive cognitive offload, or neglecting articulation of ideas, could be linked to phenomena of AI psychosis. But that's just speculative, and if I continued on this tangent, this paragraph would never end, so maybe another time.

#### Reason \#2 - Risk of input context explosion

By letting agent rely on findings from agentic loop, evaluation can lead to excessive sidetracks, and gathering excessively large input context. While such task delegation gets the job done, the achieved result could be costly at least from perspective of input tokens and even potentially surpass one-shotting, that at very least doesn't abandon nuance.

While this is a valid concern, I believe it's secondary. First of all, assuming somebody ever reads this, I have to naturally count on the fact that reader might be tokenmaxxer, therefore particular issue of LLM billing for some people might not be relevant. Matter of fact, I think it's quite unlikely that average software engineer cares either about environment, or their LLM billing dashboards, especially in cases when their employer pays for the use.

To conclude the point of excessively large input context resulting from vague prompts and agentic loops, I do not have any evidence for the stated claim about agentic detours being costlier, nor am I willing to do any research to support this claim, so in an extremely unlikely situation, where such statement were to become to be an authoritative source for something, just know that it comes from gut feeling and opinion.

#### Orchestration, a.k.a putting the pieces together

One-shotting solves many issues of agentic loop - detours, potential improvisation. One-shotting works by providing detailed directions, how agent can accomplish the stated objective, by thoroughly articulating all relevant context. There are obvious drawbacks of one-shotting

- cost of time invested in crafting the one-shot macro for complex scenarios + (potentially) testing
- a lot of complex crafted prompts are unlikely to be used ever again
  - i.e. restricted applicability, due to being poor investment of human time
    - as a consequence there are instances, where it's better strategy to be naive and trust the LLM, rather than putting excessive emphasis on details that gets put to use once in lifetime
- nobody has time for writing (or reading) essay these days

`prompt-templater` conceptually makes one-shotting more usable, by accessing large chunks of customizable text with few keystrokes. LLM skills also fill vacuum of many drawbacks of one-shotting, at least in area of software projects. LLM skills luckily succeed in making software projects procedural + they are great for markdown organization. Where LLM skills and agentic loop falls short is "orchestration"

Let's assume following conceptual model, that assumes following vaguely stated axioms

- 1 - You've got a problem to solve
- 2 - problem is decomposable to subproblems. Through first [principle analysis](https://en.wikipedia.org/wiki/First_principle), you decompose the problem to hierarchy of subproblems / [tree](<https://en.wikipedia.org/wiki/Tree_(abstract_data_type)>) data structure / [directed acyclic graph](https://en.wikipedia.org/wiki/Directed_acyclic_graph) / _some similar model_
- 3 - for each atomic problem you have predefined skill
  - i.e. you can tackle individual small problem with a few words typed as prompt - `/skill1 solve the 1st atomic problem`
- 4 - Skill can be automatically invoked in agentic loop, as skill specifies its trigger mechanisms, that can be vague or specific

I could think of following approaches

- a - rely on agentic loop with skills defined with vague trigger mechanism - i.e. let agent decide what skill is used under what conditions. This practically results in detours or improvisation, so the natural concept of this approach is acceptance of submission to a human loop - i.e. for each problem that you solve, resort to solving it by painful clanker communication, which consists of readjustments by typing 5, or 10, or 20, or more short prompts (modern form of torture if you ask me, ngl should be banned under geneve convention)
- b - rely on agentic loop with skills defined with detailed / specific skill trigger mechanisms - i.e. enumerate concrete instances when a skill should be invoked within agentic loop
  - this approach is great if coding work were reducible to a [flowchart](https://en.wikipedia.org/wiki/Flowchart). Skills work well with isolated tasks, such as delegating writing unit tests, create a document. However capabilities worsen with heavily interconnected issues with a lot of cascade effects.
    - this approach scales poorly, with large batches of interconnected concepts that depend on each other, where the main engineering limiting factor becomes amount of side effects, rather than producing source doce
      - Example (I'm repeating my self in rare case the reader happens to read the whole thing):
        - in context of monolithic backends, assume a service on which 50 other backend services depend
        - Consider situation when refactor is performed through a prompt, expected to modify such crucial service
        - Such refactor impacts
          - all the downstream services
          - all the downstream endpoints built on top of the services
          - all the downstream apps consuming the exposed endpoints.
        - With respect of tackling area of avalanche of cascading side-effects through leveraging skills.
          - While testing and deploying onto test environments, are examples of trivial matters to express with a skill, the limiting factor becomes agentic understanding of objective fulfillment.
          - This is natural, because there are way too many postconditions to take into account
            - From perspective of traditional full-stack development, post-conditions would include successful run unit tests, successful browser automation test, successful deploy, successful regression in staging environment.
        - Expressing every single cognitive nuance for agents to follow in such grey areas would produce unmaintainable amount of markdown instructions, which in case of broader refactors disorganizes the entire codebase.
          - There's no guarantee stability, because on first architectural refactor of the codebase, you tend to start without tech debt
          - If you apply fresh concepts, you abandon the outdated concepts, therefore realistically you might as well delete such markdown frameworks and start from scratch.
        - The natural solution is to resort to agentic improvisation, which leaves the door open for poor design choices and hidden bugs
          - Agent simply takes easier heuristic path of validation, effective neglecting the change impact, rather than performing thorough [brute-force](https://en.wikipedia.org/wiki/Brute-force_search) needle-in-haystack exhaustive search
        - Further issues
          - My personal assumption is that if such markdown framework specifying specifics of agentic behaviour were to be developed, there is very low chance of consensus between collaborators, due to natural diversity of human opinions of interpretations of world around
          - Human opinions are likely to differ in microdetails in agentic responses to circumstantial situations.
            - Therefore there's also a secondary risk of causing unnecessary drama in team projects and creating diversion from project intent
  - Also in practice, expressing specific skill trigger mechanism can hit limits of markdown frontmatter - [agent skills standards](https://agentskills.io/specification) for instance specifies 1024 character limits (hopefully the link is not dead)
- c - specify objective through longer prompt listing all the skils with user user inputs
  - i.e. solve higher-order problems by enumerating underlying atomic problems, and for each atomic problem, solve by using corresponding skills roughly in following manner

    ```txt
    /skill1 solve the 1st atomic problem
    /skill2 solve the 2nd atomic problem
    ```

  - `prompt-templater` could be applicable here as set of presets for higher-order problems
  - <span style="color: #FFD700;">⚠️</span> - this approach is also subjected to skill limits imposed by products such as "claude code" etc.
    - [Example quota](https://platform.claude.com/docs/en/build-with-claude/skills-guide) (hopefully the link is not dead)
- d - meta-skills
  - Define skills on top of skills
  - For instance assume that you can define skill that reuses other skills
    - example skill

      ```md
      ## Step 3: Code review

      Call the Skill tool with `code-review`.
      ```

  - In case of "meta-skill" - i.e. skills reusing other skills you potentially deal with space explosion. If the cardinality of set of skills is `n`, then set of all subsets is `2^n` (i.e. exponential)
    - i.e. if you open up area of skills, then you might end up with way too many skills
    - Personally, I highly doubt that it's a good idea to put that amount of skills (`2^n`) into software projects

Assuming we discount solution \[a\] for sake of distaste of non-determinism, in order to define universal solution that user can rely on without risking detours or improvisation, one eventually falls into area of space explosion. If we speak about behavioral micromanagement of agentic loop; if LLM users were to articulate set of rules, steering agents in their reactive behaviour, in hopes of achieving more predictable outcomes, then users should expect overwhelming amount of circumstances. Or if users were to delve into higher-order problems, that consist of subproblems for which LLM skill is articulated, since solutions for higher-order problems require combinations of skills, still we end up with space explosion of combinatorics. Regardless of the case, there are way too many options. What better way to navigate large potentially exponential space, than to maintain stash of cached snippets, accessible in a few keystrokes?

Anyways, to conclude this rant, the area of orchestrating solutions for higher-order problems is so catastrophic at least in terms of UX, that it resulted in personal endeavor to put this piece of crap software together, regardless if I'm the sole autistic user of it or not. Enjoy ;)

### Shorter version

take a look at these two images, and think which one of these two interfaces is faster, more interactive and most importantly doesn't require unreasonable amount of mental gymnastics / instructions to achieve the desired result

<p align="center">
  <img src="./resources/png/readme--03-motivation--02-screenshot-fzf.png" width="45%" style="vertical-align: middle;" alt="Comparison - fzf">
  &nbsp;&nbsp;
  <img src="./resources/png/readme--03-motivation--03-screenshot-chatgpt-ui.png" width="45%" style="vertical-align: middle;" alt="Comparison - ChatGPT">
</p>

## Feature support

<span style="color: #FFD700;">⚠️</span> this section is work in progress and potentially subject to frequent changes

### workflow syntax

TBD

### `handlebars` template syntax

`prompt-templater` uses restricted `handlebars` template syntax

Following `handlebars` features are not supported

- [`decorators`](https://handlebarsjs.com/api-reference/runtime.html#handlebars-registerdecorator-name-helper-deprecated)
- [`partials`](https://handlebarsjs.com/guide/partials.html)

unsupported features are defined with respect to codebase [here](./src/constants/enums/templateEngines/handlebars/ast.ts)

### [`handlebars` block helpers](https://handlebarsjs.com/guide/builtin-helpers.html)

Block syntax, for instance

```hbs
{{#if 0 includeZero=true}}
  <h1>Does render</h1>
{{/if}}
```

defines block keywords (in this case `if`, in `#if` block)

following block helpers are supported

- `with`
- `each`
- `if`
- `unless`
- `ifEquals`
- `unlessEquals`

This feature is expected to improve over time

Supported block helpers are defined [here](./src/constants/enums/templateEngines/handlebars/ast.ts)

### Template validation against workflow

Workflow specification validated against template variable references retrieved from parsed `handlebars` AST, i.e. unmatched variables should return errors

<img src="./resources/png/readme--04-feature-support--01-variable-reference-in-template-resource.png" alt="Comparison - fzf">
<img src="./resources/png/readme--04-feature-support--01-variable-reference-in-workflow-resource.png" alt="Comparison - ChatGPT">

This validation can be skipped by passing `--skip-template-validation` CLI option

### `-u/--unsafe-render` CLI option

TBD

## Roadmap

- Docs improvement - document workflow syntax
- lazy-loading + dynamic terms
- nested workflows
- refactor to some better runtime than `bun` (chosen for proof-of-concept purposes)
- `vim` keybindings + probably other session engines than `inquirer`
- \+ probably more stuff..

## Anyways...

Made with power of friendship and [good](https://www.youtube.com/watch?v=ISToCH2STF0) [vibez](https://www.youtube.com/watch?v=husiHTQptvE)

Feel free to submit feature request and all that stuff (although I assume that's quite naive from me to expect :D :D)

Also shoutout to Simba from Lion King
