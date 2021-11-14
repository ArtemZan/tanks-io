
function MergeClassName(class_name1, class_name2)
{
    return class_name1 + (class_name2 ? " " + class_name2 : "");
}

function Button({content, onClick, children, className}) {
    if(typeof onClick !== "function")
    {
        console.error("'Button' component must receive 'onClick' event listenner");
        onClick = () => {};
    }

    return(
        <button className = {MergeClassName("button", className)} onClick = {onClick}>
            {content}
            {children}
        </button>
    )
}

function Dropdown({ buttonContent, options, className }) {


    return (
        <div className={MergeClassName("dropdown", className)}>
            <button>
                {buttonContent}
            </button>
            <ul className = "dropdown-content">
                {options.map((el, index) => <li key = {index}>{el}</li>)}
            </ul>
        </div>

    )
}

export{
    Dropdown, Button
}