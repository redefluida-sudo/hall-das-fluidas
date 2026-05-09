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
      }),
    });

    const data = await r.json();

    if (!data.results) {
      return res.status(200).json({ debug: true, status: r.status, data });
    }

    const fluidas = data.results.map(p => {
      const props = p.properties;

      const nome = props["Mentoradas"]?.title?.[0]?.plain_text?.trim() ?? "";

      // Campo tem espaço no final: "INSTAGRAM "
      const instagramRaw = props["INSTAGRAM "]?.url ?? "";
      let instagram = instagramRaw.replace(/\/$/, "");
      if (instagram && !instagram.startsWith("http")) {
        instagram = "https://" + instagram;
      }

      const handle = instagram
        .replace("https://www.instagram.com/", "@")
        .replace("https://instagram.com/", "@")
        .replace("http://www.instagram.com/", "@")
        .replace("http://instagram.com/", "@");

      const nicho = props["Nicho"]?.rich_text?.[0]?.plain_text ?? "";

      const foto = p.icon?.type === "file"
        ? p.icon.file.url
        : p.icon?.type === "external"
        ? p.icon.external.url
        : null;

      return { nome, instagram, handle, nicho, foto };
    }).filter(f => f.nome);

    res.status(200).json(fluidas);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
