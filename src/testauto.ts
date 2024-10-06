const target = "connect";

import(`./test/${target}.js`)
  .then((module) => {
    module.test();
  })
  .catch((err) => {
    console.error("Module could not be loaded:", err);
  });
