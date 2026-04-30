export function splitPromptSections(prompt: string) {
  return prompt
    .split(/\n(?=#|##)/)
    .map((section) => section.trim())
    .filter(Boolean)
}
