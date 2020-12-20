import React from "react";

const useIdGenerator = () => {
    const ALPHABET =
        "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

    const generate = (length: number): string => {
        let rtn = "";
        for (let i = 0; i < length; i++) {
            rtn += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
        }
        return rtn;
    };

    return { generate }
}

export { useIdGenerator }
