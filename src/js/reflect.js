/**
 * Reflect module — sends notes to Claude API and returns structured reflection.
 * Direct browser-to-API call. No intermediary server.
 */
const Reflect = (() => {

  function buildPrompt(notes, meetingTitle, participants, objectives) {
    const objectivesList = objectives.length > 0
      ? objectives.map((o, i) => `  ${i + 1}. ${o}`).join('\n')
      : '  (No objectives defined yet — provide general productivity guidance)';

    return `You are a sharp, honest personal reflection coach. A user has just finished a meeting or conversation and is telling you what happened. Your job is to help them extract signal from noise, challenge them on time management, and map everything back to their strategic objectives.

Here are their strategic objectives:
${objectivesList}

Meeting/conversation: ${meetingTitle || 'Untitled'}
Participants: ${participants || 'Not specified'}

Their raw notes:
---
${notes}
---

Respond with a structured reflection in this EXACT JSON format (no markdown, just valid JSON):
{
  "summary": "1-2 sentence summary of what actually happened",
  "decisions": ["list of decisions that were made or implied"],
  "action_items": [
    {
      "task": "what needs to be done",
      "owner": "who should do it (if mentioned)",
      "objective": "which strategic objective this maps to, or null"
    }
  ],
  "insights": ["key things learned, realized, or that shifted thinking"],
  "open_questions": ["unresolved questions or ambiguities"],
  "objective_alignment": [
    {
      "objective": "the strategic objective",
      "status": "advancing | stalled | at risk | not addressed",
      "note": "brief explanation"
    }
  ],
  "time_challenge": "A direct, honest 2-3 sentence challenge to the user about their time management based on what they described. Be constructive but don't be soft. Ask them a hard question about whether this meeting was the best use of their time, or what they'd do differently.",
  "energy_read": "One sentence on the emotional/energy tone you detect from their notes — are they energized, frustrated, scattered, focused?"
}

Be concise. Be honest. Don't pad the output. If the notes are vague, say so and push back.`;
  }

  async function analyze(notes, meetingTitle, participants) {
    const apiKey = Storage.getApiKey();
    if (!apiKey) {
      throw new Error('No API key set. Go to Settings to add your Claude API key.');
    }

    const objectives = Objectives.getAll();
    const prompt = buildPrompt(notes, meetingTitle, participants, objectives);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      if (response.status === 401) {
        throw new Error('Invalid API key. Check your key in Settings.');
      }
      throw new Error(`API error (${response.status}): ${err}`);
    }

    const data = await response.json();
    const text = data.content[0].text;

    // Parse JSON from response (handle potential markdown wrapping)
    let jsonStr = text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    return JSON.parse(jsonStr);
  }

  return { analyze };
})();
