import { MouseEventHandler } from "react";

type ParentProps = { children: any } | { content: any }
type OptionalParentProps = ParentProps | {}

type ButtonProps = { onClick: MouseEventHandler, className?: string } & ParentProps

function MergeClassName(class_name1: string, class_name2?: string) {
    return class_name1 + (class_name2 ? " " + class_name2 : "");
}

function Button(props: { onClick: MouseEventHandler, className?: string } & ParentProps) {
    if (typeof props.onClick !== "function") {
        console.error("'Button' component must receive 'onClick' event listenner");
        props.onClick = () => { };
    }

    return (
        <button className={MergeClassName("button", props.className)} onClick={props.onClick}>
            {"content" in props && props.content}
            {"children" in props && props.children}
        </button>
    )
}

function Link(props: { url: string, className?: string } & ParentProps) {
    return (
        <a href={props.url} className={MergeClassName("link", props.className)}>
            {"content" in props && props.content}
            {"children" in props && props.children}
        </a>
    )
}

function Dropdown(props: { buttonContent: any, options: any[], className: string }) {
    return (
        <div className={MergeClassName("dropdown", props.className)}>
            <button>
                {props.buttonContent}
            </button>
            <ul className="dropdown-content">
                {props.options.map((el, index) => <li key={index}>{el}</li>)}
            </ul>
        </div>

    )
}

type Position = "top" | "left" | "bottom" | "right"

function Tooltip(props: { className: string, position: Position, showOnHover?: boolean } & ParentProps) {
    const { className, position, showOnHover = false } = props

    
    return <div className={MergeClassName(`tooltip ${position}${showOnHover ? " show-on-hover" : ""}`, className)}>
        {"content" in props && props.content}
        {"children" in props && props.children}
    </div>
}

export {
    Dropdown, Button, Link, Tooltip
}