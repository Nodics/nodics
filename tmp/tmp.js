[
    // action description
    {
        index: {
            _index: 'myindex',
            _type: 'mytype',
            _id: 1
        }
    },
    // the document to index
    {
        title: 'foo'
    },
    // action description
    {
        update: {
            _index: 'myindex',
            _type: 'mytype',
            _id: 2
        }
    },
    // the document to update
    {
        doc: {
            title: 'foo'
        }
    },
    // action description
    {
        delete: {
            _index: 'myindex',
            _type: 'mytype',
            _id: 3
        }
    },
    // no document needed for this delete
]