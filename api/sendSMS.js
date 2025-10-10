export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { to, message } = req.body;

  try {
    const response = await fetch("https://lqnelj.api.infobip.com/sms/2/text/advanced", {
      method: "POST",
      headers: {
        "Authorization": "App a92653d3c0999e1e8534179a660e4137-de0ee46d-52e1-43af-8020-1acabc11278e",
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        messages: [
          {
            destinations: [{ to }],
            from: "Poste39",
            text: message
          }
        ]
      })
    });

    const result = await response.json();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
