import React, { useContext, useEffect } from 'react'
import { MessageContext } from '../Providers/MessageProvider';
import { useSnackbar } from "../CustomSnackbar";
import { Button } from "@material-ui/core";

interface Props {
    children?: React.ReactNode
}

const MessageHandler: React.FC<Props> = ({ children }) => {
    const { addSnack, removeSnack } = useSnackbar();
    const [messages] = useContext(MessageContext);

    useEffect(() => {
        if (messages.length > 0) {
            let item: { id: string | number, message: string, severity: string } = messages.shift();
            addSnack(item.message, { id: item.id, severity: item.severity, stack: true, action: <Button style={{ color: "white" }} onClick={() => removeSnack(item.id)}>Dismiss</Button> });
        }
    }, [removeSnack, messages, addSnack]);

    return (
        <span className="placeholder">{children}</span>
    )
}

export default MessageHandler
