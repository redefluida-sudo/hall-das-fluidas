export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const token = process.env.NOTION_TOKEN;
  const dbId  = process.env.NOTION_DB_ID;

  try {
    const r = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filter: {
          property: "Status",
          select: { equals: "Ativa" },
        },
        sorts: [{ property: "Mentoradas", direction: "ascending" }],
        page_size: 1,
      }),
    });

    const data = await r.json();

    if (!data.results) {
      return res.status(200).json({ debug: true, data });
    }

    // Mostra TODOS os campos da primeira mentorada
    const primeira = data.results[0];
    return res.status(200).json({
      debug: true,
      todos_os_campos: Object.keys(primeira.properties),
      properties: primeira.properties,
    });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
