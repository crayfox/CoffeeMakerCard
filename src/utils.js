export function formatProgramName(entityId) {
  if (!entityId) entityId = localStorage.getItem('coffeeSelectedProgram') || 'consumer_products_coffee_maker_program_beverage_espresso';
  
  let raw = entityId;
  const programPrefix = "consumer_products_coffee_maker_program_beverage_";
  if (raw.startsWith(programPrefix)) {
    raw = raw.substring(programPrefix.length);
  }

  let parts = raw.split("_");
  
  if (parts[0] === 'coffee') {
    parts[0] = 'caffe';
    parts[1] = 'crema';
  }

  let ignoredParts = new Set([
    "consumer", "products", "coffee", "maker", "program", "beverage", "world",
    "enum", "type",
  ]);

  parts = parts.filter(p => !ignoredParts.has(p));

  let formattedParts = parts.map(p => {
    if (p === 'xl') return 'XL';
    return p.charAt(0).toUpperCase() + p.slice(1).toLowerCase();
  });

  return formattedParts.join(" ")
    .replace('X L', 'Caffe XL')
    .replace('ae', 'ä');
}
