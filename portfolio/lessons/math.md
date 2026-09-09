# Dot Lab

## Purpose

A short visual game: look at a quantity, give an answer, and report whether you saw groups, counted one by one, or guessed. Start without a timer. The site computes the score; the bot interprets the resulting note.

## Start gently

Default to **Relaxed**: 2–4 dots, grouped patterns, six rounds, and no timer. The dots stay visible until the learner chooses **I’m ready to answer**. Counting is welcome. Do not frame difficulty or a slower pace as failure.

The page has three pace buttons. Choosing one prepares a fresh session:

- **Relaxed:** level 1, `ms=0`, six rounds, grouped.
- **Steady:** level 1, `ms=3000`, six rounds, mixed. Offer this only when the learner wants a gentle timer and a layout comparison.
- **Challenge:** level 2, `ms=1200`, eight rounds, mixed. Offer it when the learner asks for more difficulty.

Do not advance automatically. If the learner finds it too hard, send the Relaxed link. Faster flashes remain available in the custom settings for learners who request them.

## Design

- Level 1: 2–4 dots. Level 2: 5–7. Level 3: 8–10.
- Exposure choices: untimed (default), 5000 ms, 3000 ms, 1200 ms, 650 ms, or 350 ms.
- Length: 6, 8, or 12 rounds.
- Layout choices: grouped, scattered, or mixed.
- In mixed mode each sampled number occurs once grouped and once scattered; trial order is shuffled.
- Grouped patterns use small dice-like arrangements, split into two groups when there are more than four dots. Scattered patterns use separated, jittered positions.
- The answer is scored against the number of points actually generated, not a language model's count.
- A background-tab interruption during the exposure cancels that exposure and offers to replay the round. It is not scored.

## Measurements

The note gives accuracy by layout, self-reported counting frequency, mean response time, and each trial's quantity, answer, strategy, measured viewing duration, and response time.

The timer uses browser scheduling. Actual exposure can differ from the requested milliseconds. Response time starts when the pattern is hidden and includes entering an answer and selecting a strategy. It is not a pure perceptual reaction-time measurement. Untimed trials should not be compared as if their exposure were fixed.

## Interpretation

For grouped practice, ask: “What helped you see the number?” When both arrangements were tested, ask: “Which arrangement felt easier, and do your results show the same pattern?” Look at correct answers and the learner's strategy reports. Small differences in a handful of trials can arise by chance or from familiarity, order, attention, input speed, and practice.

Grouped quantities can be recognized as smaller parts and combined. Some learners may still count them. Do not promise that a quantity is instantly seen by everyone. Do not diagnose ability or infer a child's developmental level from an adult's short session.

## A follow-up experiment

Change one setting while holding the rest fixed, such as moving from 5000 to 3000 milliseconds with the same level and mixed layouts. Remind the learner that the new session has new patterns and that practice may also change results. Preset changes can alter multiple settings, so use the custom controls for a comparison that changes only one setting. Return to Relaxed whenever a brief display is uncomfortable or unhelpful.
