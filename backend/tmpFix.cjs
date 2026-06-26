const fs = require('fs');
const p = 'D:/taffy-fan-site/backend/src/controllers/postController.ts';
let c = fs.readFileSync(p, 'utf8');

// 在 getPosts 函数的 SELECT 查询之后、keyword 过滤之前添加 status 过滤
// 把 "INNER JOIN users u ON p.user_id = u.id\n        `;" 修改为带有 WHERE 条件
c = c.replace(
  "FROM posts p\n        INNER JOIN users u ON p.user_id = u.id\n        `;",
  "FROM posts p\n        INNER JOIN users u ON p.user_id = u.id\n        WHERE p.status = 'approved'"
);

// 修正 countQuery 也同样要改
c = c.replace(
  "let countQuery = 'SELECT COUNT(*) AS total FROM posts p';",
  "let countQuery = \"SELECT COUNT(*) AS total FROM posts p WHERE p.status = 'approved'\";"
);

// 修正 keyword 条件中的 WHERE -> AND
c = c.replace(
  "WHERE p.status = 'approved'\n\n        if (keyword) {",
  "WHERE p.status = 'approved'\n\n        let params: any = {};\n\n        if (keyword) {"
);
// 上面加多了 let params 行，但看看实际代码，还要在 keyword 里把 WHERE 换成 AND

// 修改 keyword 分支中的 WHERE 为 AND（因为已经有 WHERE p.status = 'approved'）
c = c.replace(
  "if (keyword) {\n            query += \" WHERE p.title LIKE @keyword OR p.content LIKE @keyword\";\n            countQuery += \" WHERE p.title LIKE @keyword OR p.content LIKE @keyword\";\n            params.keyword = \`%\${keyword}%\`;\n        }",
  "if (keyword) {\n            query += \" AND (p.title LIKE @keyword OR p.content LIKE @keyword)\";\n            countQuery += \" AND (p.title LIKE @keyword OR p.content LIKE @keyword)\";\n            params.keyword = \`%\${keyword}%\`;\n        }"
);

fs.writeFileSync(p, c, 'utf8');
console.log('Fixed!');
