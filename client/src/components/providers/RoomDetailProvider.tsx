import React, { useState } from 'react'

interface RoomDetail {
    room_id: string,
    room_name: string,
    user_id: string,
    user_name: string,
}

interface RoomPermission {
    camera: boolean,
    microphone: boolean
}

interface Props {
    children: React.ReactNode
}

interface ContextType {
    roomDetail: [RoomDetail, React.Dispatch<React.SetStateAction<RoomDetail>>],
    roomPermission: [RoomPermission, React.Dispatch<React.SetStateAction<RoomPermission>>]
}

const initialValueRoomDetail = {
    room_id: "", room_name: "", user_id: "", user_name: ""
}

const initialValueRoomPermission = {
    microphone: true, camera: false
}

const RoomDetailContext = React.createContext<ContextType>({ roomDetail: [initialValueRoomDetail, () => { }], roomPermission: [initialValueRoomPermission, () => { }] });

const RoomDetailProvider: React.FC<Props> = ({ children }) => {
    const [roomDetail, setRoomDetail] = useState<RoomDetail>(initialValueRoomDetail);
    const [roomPermission, setRoomPermission] = useState<RoomPermission>(initialValueRoomPermission);
    return (
        <RoomDetailContext.Provider value={{ roomDetail: [roomDetail, setRoomDetail], roomPermission: [roomPermission, setRoomPermission] }}>
            {children}
        </RoomDetailContext.Provider>
    )
}

export { RoomDetailProvider, RoomDetailContext }
