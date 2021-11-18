import { forwardRef } from "react";

function MergeClassName(class_name1, class_name2) {
    return class_name1 + (class_name2 ? " " + class_name2 : "");
}

function Button({ content, onClick, children, className }) {
    if (typeof onClick !== "function") {
        console.error("'Button' component must receive 'onClick' event listenner");
        onClick = () => { };
    }

    return (
        <button className={MergeClassName("button", className)} onClick={onClick}>
            {content}
            {children}
        </button>
    )
}

function Link({ content, url, children, className })
{
    return (
        <a href = {url} className={MergeClassName("link", className)}>
            {content}
            {children}
        </a>
    )
}

function Dropdown({ buttonContent, options, className }) {


    return (
        <div className={MergeClassName("dropdown", className)}>
            <button>
                {buttonContent}
            </button>
            <ul className="dropdown-content">
                {options.map((el, index) => <li key={index}>{el}</li>)}
            </ul>
        </div>

    )
}

function Tooltip({ className, children, content, position = "top", showOnHover }) {
    if(!position.match(/(top)|(bottom)|(left)|(right)/))
    {
        console.error("Invalid position given to 'Tooltip' component");
        return null;
    }
    return <div className={MergeClassName(`tooltip ${position}${showOnHover ? " show-on-hover" : ""}`, className)}>
        {content}
        {children}
    </div>
}

export {
    Dropdown, Button, Link, Tooltip
}