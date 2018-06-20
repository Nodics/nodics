import React from 'react';
import ReactDOM from 'react-dom';

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {

        }
    }

    render() {
        console.log(':::::::')
        return (
            <div>
                <h1>React Admin setup complete</h1>
            </div>
        )
    }
}

ReactDOM.render(<App />, document.getElementById('root'));