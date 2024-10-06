async function dynamicImport(target: string) {
  try {
    const module = await import(`./test/${target}.js`);
    module.test();
  } catch (err) {
    console.error("Module could not be loaded:", err);
  }
}

// コマンドライン引数を取得 (最初の2つの要素はNode.js自体とファイル名なので無視)
const test = process.argv[2]; // "memtool" が入る

if (test) {
  dynamicImport(test);
} else {
  console.error("Please provide a target module.");
}
