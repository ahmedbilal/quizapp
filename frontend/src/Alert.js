import React from "react";

export default function Alert({type, children}) {
    console.log(type);
    console.log(children);
    let className = "p-5 text-white font-bold text-xl rounded-sm";
    switch(type) {
        case "success":
            className += " bg-green-500";
            break;
        case "warning":
            className += " bg-yellow-500";
            break;
        case "danger":
            className += " bg-red-500";
            break;
        default:
            break
    }

    return (
        <div className={className}>
            {children}
        </div>
    )
}