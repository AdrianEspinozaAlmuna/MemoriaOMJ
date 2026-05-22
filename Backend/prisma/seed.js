async function main() {
  console.log("Seed deshabilitado: no se cargan datos de ejemplo.");
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});