/**
 * Generate a Bring! deeplink to add ingredients to a shopping list.
 * Uses the Bring! REST API to get a universal deeplink.
 */
export function generateBringDeeplink(): string {
  const params = new URLSearchParams({
    source: 'web',
    url: window.location.href,
  })
  return `https://api.getbring.com/rest/bringrecipes/deeplink?${params.toString()}`
}

/**
 * Format ingredients list as a text string for sharing
 */
export function formatShoppingList(ingredients: string[]): string {
  const unique = [...new Set(ingredients.map(i => i.trim().toLowerCase()))]
  return unique.map(i => `- ${i.charAt(0).toUpperCase() + i.slice(1)}`).join('\n')
}
