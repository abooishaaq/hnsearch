import Head from "next/head";
import {
    DetailedHTMLProps,
    HTMLAttributes,
    InputHTMLAttributes,
    useRef,
} from "react";

type IInputProps = DetailedHTMLProps<
    InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
> & {
    label?: string;
    containerProps?: DetailedHTMLProps<
        HTMLAttributes<HTMLDivElement>,
        HTMLDivElement
    >;
};

const Input = (props: IInputProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const { label, containerProps, ...rest } = props;

    return (
        <>
            <Head>
                <title>Search Hacker News</title>
            </Head>
            <div
                className="relative md:w-6/12 w-10/12"
                {...containerProps}
            >
                <input
                    {...rest}
                    ref={inputRef}
                    className={`${
                        props.className ? props.className : ""
                    } bg-beige dark:bg-blue dark:text-beige rounded py-3 px-5 border border-blue dark:border-beige acive:border-2 transition duration-100 text-blue my-2 z-10 outline-none w-full`}
                    placeholder={props.label}
                />
                <label
                    className="bg-beige dark:bg-blue dark:text-beige px-1 select-none"
                    onClick={() => inputRef.current?.focus()}
                >
                    {props.label}
                </label>
            </div>
            <style jsx>{`
                input:focus ~ label,
                input:not(:placeholder-shown) ~ label {
                    transform: translateY(-1.5rem) translateX(-0.6rem) scale(0.8);
                    z-index: 11;
                }

                label {
                    position: absolute;
                    top: 1.25rem;
                    left: 1rem;
                    transform: translateY(0) scale(1);
                    transition: all 0.1s ease-in-out;
                    cursor: text;
                }

                input::placeholder {
                    opacity: 0;
                }

                input:focus:invalid {
                    border: 1px solid crimson;
                }
            `}</style>
        </>
    );
};

export default Input;