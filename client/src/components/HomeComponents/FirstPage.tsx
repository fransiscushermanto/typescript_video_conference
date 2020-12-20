import React, { Component } from 'react'

interface Props {
    setCurrentPage: React.Dispatch<React.SetStateAction<string>>,
}

class FirstPage extends Component<Props> {

    render() {
        const { setCurrentPage } = this.props;
        return (
            <div className="action-btn-wrapper">
                <div className="inner-wrapper">
                    <button onClick={() => setCurrentPage("join")} className="btn">Join Room</button>
                    <button onClick={() => setCurrentPage("create")} className="btn">Create Room</button>
                </div>
            </div>
        )

    }
}

export default FirstPage
