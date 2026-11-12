---
layout: post
title: "A German language model for FUTO Keyboard"
date:   2026-11-12 15:30:00 +0000
categories: machine-learning
---

## Autocorrect that speaks German

[FUTO Keyboard](https://github.com/futo-org/android-keyboard) is an Android keyboard that works completely offline. For predictions it runs a small transformer language model on the phone: next-word suggestions, completing the word you're typing, and autocorrect. Officially, that model only exists for English.

<!-- TODO: why you wanted this. Do you use FUTO yourself? How does typing German feel without the model? -->

So I trained a German one. Version 1.0 is out as a [GitHub release](https://github.com/dschoerk/futo-german-transformer/releases/tag/v1.0): a single 37.4 MB file, `de_keyboard_v1.0_q6_k.gguf`, that you can import into the app. The training pipeline is on GitHub too: [dschoerk/futo-german-transformer](https://github.com/dschoerk/futo-german-transformer).

It turns typing noise into German words, including umlauts and ß:

| Typed     | Suggestion          |
|-----------|---------------------|
| `schln`   | *schön*, *schon*    |
| `morgn`   | *morgen*            |
| `spatee`  | *später*            |
| `deztdcl` | *Deutschland*       |

### What the keyboard expects from a model
There's no official documentation for custom models, so the first step was reading the app's source to find out what a model file must look like. In short:

- **Container:** a [GGUF](https://github.com/ggml-org/ggml/blob/master/docs/gguf.md) file with a Llama architecture, plus a few `keyboardlm.*` metadata fields: the language, the supported features, and the SentencePiece tokenizer embedded as a byte blob.
- **Tokenizer:** a SentencePiece unigram model where whitespace is attached to the *end* of a word (`Das▁ ist▁ gut▁`).
- **Autocorrect protocol:** the word you're typing is fed to the model letter by letter as special `<CHAR_A>` … `<CHAR_Z>` tokens, framed by `<XBU>`, `<XBC>` and `<XEC>`. The model then generates the corrected word:

```
<context> <XBU><CHAR_s><CHAR_c><CHAR_h><CHAR_l><CHAR_n><XBC>schön▁<XEC>
```

- **Key mixing:** the app doesn't feed one letter per tap. It feeds a weighted mix of the embeddings of the up to four keys nearest to where your finger landed.

Two findings matter for German in particular. First, the app only uses the transformer for in-word completion and autocorrect on layouts it recognizes as QWERTY. German QWERTZ fails that check unless you enable a developer setting. Second, the app passes typed letters to the model by their UTF-8 bytes but indexes the tap coordinates by keystroke. Since ä, ö, ü and ß are two bytes each, everything after an umlaut gets shifted. I found that by reading the code and haven't confirmed it on a device yet.

I also wasn't the first to try this. There are already two community German models, by [jblechert](https://github.com/jblechert/keyboard-lm-de) and [VerbalJungle](https://github.com/VerbalJungle/FUTO-Transformer-DE), along with models for Portuguese, Basque, Greek, Polish, Russian and more. The central discussion is [futo-org/android-keyboard#1212](https://github.com/futo-org/android-keyboard/issues/1212). One thing I noticed while surveying them: two of the models declare feature flags that are missing or misspelled, so the app probably ignores those features. My model copies the feature string exactly from FUTO's English model.

### Data and tokenizer
The training data is 10.67 million cleaned German sentences: 5.0M from Wikipedia, 5.0M from [FineWeb-2](https://huggingface.co/datasets/HuggingFaceFW/fineweb-2) (`deu_Latn`) and 0.67M from OPUS-100. On top of it sits a 20k-token SentencePiece unigram tokenizer, with the 26 `<CHAR_*>` tokens at consecutive ids, because the app computes their ids as `CHAR_A + i`.

About half of the training sentences contain an autocorrect example: a word is replaced by a noisy version of itself, generated with a QWERTZ typing model (Gaussian noise on the key positions, swapped and deleted letters, and truncated words for completion), and the model has to produce the original. Because the app never passes umlaut keys as letters, an umlaut in the noisy version is typed the way a real user might: as the base letter (*a*), as a digraph (*ae*), as the neighboring key on FUTO's "Deutsch" layout, or not at all. That's how the model learns to restore umlauts.

### Training like the app infers
The most useful step was a review of the pipeline against the app's actual inference code. It found several mismatches between how I trained and how the keyboard would use the model:

- **A trailing space.** The app tokenizes the context as `trim(context) + " "`. My first tokenizer stripped extra whitespace, so the context ended mid-word at inference time, while training always saw `word▁`. Retraining the tokenizer with `remove_extra_whitespaces=False` fixed it.
- **Short contexts.** The app sends only the current line, cut to at most 70 characters, often starting mid-sentence. The training sequences now start at random points, not only at sentence starts.
- **Key mixing.** Training fed the `<CHAR_*>` tokens one-hot, but the app always feeds mixes of nearby keys. Training now mixes the embeddings the same way.
- **Model size.** A first version had 10 layers. I went down to 8 layers, like the English model, to keep it fast on a phone.

### Training run
The model is a 34.4M-parameter Llama: 8 layers, hidden size 512, FFN size 1280. It trained on an RTX 3090 for 52,960 steps, 3 epochs over about 1.7 billion tokens, which took about five hours. I power-capped the GPU to 280 W, which got rid of the thermal pauses the run had at the start.

![Training curves: validation loss falls from 4.82 to 2.98 and token accuracy rises from 28.9% to 46.7% over 52,960 steps]({{ '/assets/images/futo-german-training-progress.png' | relative_url }})

Validation loss went from 4.82 to 2.98, and token accuracy from 28.9% to 46.7%. Both were still improving at the end, so more data or epochs would probably help.

### Export and checks
Exporting to GGUF had its own traps:

- **The tokenizer blob.** My first export wrote the tokenizer as an `INT32` array. The app reads it as raw bytes, so loading SentencePiece would have failed on the phone. `check_gguf.py` now emulates the app's read and compares every metadata key and type with the English model.
- **RoPE permutation.** llama.cpp expects the query and key weights in a different order than PyTorch. The check compares the logits of llama.cpp and PyTorch on the same prompts. The f16 export matches exactly; the Q6_K quantized version has a mean KL divergence of 0.0056, and every top-1 difference is a near-tie.

### Evaluation
To get numbers that mean something for the keyboard, the evaluation script ports the app's sampling logic from its native code: a 3-wide beam search with punctuation tokens banned. On held-out sentences:

| Task                                     | Top-1 | Top-3 | Cases |
|------------------------------------------|-------|-------|-------|
| Autocorrect/completion from noisy typing | 65.5% | 78.7% | 1,913 |
| Full-word autocorrect                    | 74.0% | 86.8% | 1,435 |
| Next word                                | 19.8% | 33.5% | 1,919 |

Some examples from the test set:

- After *"vor allem in älterer deutschsprachiger"*, the typed `jzersz` becomes *Literatur*, which is also the top next-word prediction.
- After *"Die Reformation"*, `sr` becomes *war*.
- After *"Zudem"*, `erfofemt` (meant: *veröffentlicht*) becomes *eröffnete*. That's wrong, but honestly a reasonable guess.

Compared with a preview checkpoint at step 10k on the same 420 cases, top-1 improved in every task: autocorrect from 59.5% to 66.9%, full-word autocorrect from 67.0% to 73.9%, and next word from 14.3% to 20.2%.

One caveat: the test sentences come from the same prose sources as the training data. Chat messages will likely score lower, especially for next-word prediction.

<!-- TODO: once you've compared against jblechert and VerbalJungle on the same test set, add the results here -->

### Try it
1. Download [`de_keyboard_v1.0_q6_k.gguf`](https://github.com/dschoerk/futo-german-transformer/releases/tag/v1.0) to your phone.
2. In FUTO Keyboard, go to Settings → Help & About and tap **Version code** 8 times to unlock the developer settings.
3. In the developer settings, enable **Allow transformer models on non QWERTY layouts**. Without it you only get next-word suggestions on German layouts.
4. Go to Predictive text → Transformer models → **Import from file**. The model should show up as the default for `de`.
5. Switch to a German layout.

### Limitations and what's next
- **Not tested on a real device yet.** All numbers come from the ported sampling logic. Feedback via [issues](https://github.com/dschoerk/futo-german-transformer/issues) is welcome.
- **Trained on written prose.** Chat-style text works, but colloquial forms are weak. Contractions like *geht's* or *hab's* are rarely suggested, and typing `gehts` stays *gehts*. Only *gibt's* works.
- **No emoji.** The tokenizer has no emoji pieces, so the app can never suggest them.
- **The format may go away.** In October, a FUTO developer wrote that the prediction system is being reworked and custom transformer models will most likely stop working at some point. Hopefully the new system brings official support for more languages.

The plan for a v2 is a chat-focused model: German subtitles and Tatoeba sentences as a proxy for chat messages, augmentation with lowercase starts, missing punctuation and chat abbreviations, frequent contractions like `geht's▁` as single tokens, and emoji in the vocabulary. The details are in [`docs/V2_PLAN.md`](https://github.com/dschoerk/futo-german-transformer/blob/main/docs/V2_PLAN.md).

<!-- TODO: if you built this with Claude Code, a paragraph on that workflow (the whole v1, from reading the FUTO source to the release, happened in one day) -->
