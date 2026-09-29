module.exports = async (req, res) => {
    // Enable CORS so Google Sites can securely communicate with your API
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // Dynamically query public domain audio from the Internet Archive API
        const apiResponse = await fetch('https://archive.org/advancedsearch.php?q=collection:(etree)+AND+mediatype:(audio)&fl=identifier,title,creator&rows=6&output=json');
        const data = await apiResponse.json();
        const docs = data.response.docs || [];

        // Map raw database items into clean, playable track objects
        const tracks = docs.map((doc, index) => ({
            id: index + 1,
            title: doc.title || `Study Track ${index + 1}`,
            artist: doc.creator || 'Public Domain Archive',
            url: `https://archive.org/download/${doc.identifier}/${doc.identifier}_vbr.mp3`
        }));

        if (tracks.length === 0) throw new Error('No tracks found');

        return res.status(200).json(tracks);
    } catch (err) {
        // Fallback playlist to ensure music always plays even if the archive query hiccups
        const fallbackTracks = [
            { id: 1, title: 'Midnight Lofi Study', artist: 'CampusLofi Beats', url: 'https://archive.org/download/testmp3testfile/test_64kb.mp3' },
            { id: 2, title: 'Ambient Library Focus', artist: 'StudySound Archive', url: 'https://archive.org/download/testmp3testfile/test_64kb.mp3' }
        ];
        return res.status(200).json(fallbackTracks);
    }
};
