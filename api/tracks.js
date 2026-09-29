module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();

    // Grab search query from URL parameters
    const query = req.query.q || '';

    try {
        let archiveQuery = 'collection:(etree)+AND+mediatype:(audio)';
        if (query.trim() !== '') {
            archiveQuery = `(${query})+AND+mediatype:(audio)`;
        }

        const url = `https://archive.org/advancedsearch.php?q=${encodeURIComponent(archiveQuery)}&fl=identifier,title,creator&rows=25&output=json`;
        const apiResponse = await fetch(url);
        const data = await apiResponse.json();
        const docs = data.response.docs || [];

        const tracks = docs.map((doc, index) => ({
            id: doc.identifier || index,
            title: doc.title || `Track ${index + 1}`,
            artist: doc.creator || 'Public Domain Archive',
            url: `https://archive.org/download/${doc.identifier}/${doc.identifier}_vbr.mp3`
        }));

        res.status(200).json(tracks.length > 0 ? tracks : getFallback());
    } catch (err) {
        res.status(200).json(getFallback());
    }
};

function getFallback() {
    return [
        { id: '1', title: 'Midnight Lofi Study', artist: 'CampusLofi', url: 'https://archive.org/download/testmp3testfile/test_64kb.mp3' },
        { id: '2', title: 'Ambient Library Focus', artist: 'StudySound', url: 'https://archive.org/download/testmp3testfile/test_64kb.mp3' }
    ];
}
