import type { NextPage } from "next";
import { KeyboardEventHandler, useEffect, useRef, useState } from "react";
import Input from "../components/Input";
import { FixedSizeList as List, ListOnScrollProps } from "react-window";
import Link from "next/link";

interface IPost {
    id: string;
    title: string;
    url: string;
    author: string;
    createdAt: Date;
}

const postHeight = 352;

const Home: NextPage = () => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<IPost[]>([]);
    const [currPage, setCurrPage] = useState(0);
    const fetchedCurr = useRef(false);
    const fetching = useRef(false);
    const numPages = useRef(0);
    const timeoutRef = useRef<NodeJS.Timeout | number | undefined>(undefined);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
    };

    useEffect(() => {
        clearTimeout(timeoutRef.current);

        if (query.length === 0) {
            setResults([]);
            return;
        }

        timeoutRef.current = setTimeout(() => {
            fetch(
                `https://hn.algolia.com/api/v1/search?query=${query
                    .split(/s+/)
                    .map((q) => encodeURIComponent(q))
                    .join("+")}`
            )
                .then((res) => res.json())
                .then((res) => {
                    setResults(
                        res.hits.map((h: any) => ({
                            id: h.objectID,
                            title: h.title ? h.title : h.story_title,
                            url: h.url ? h.url : h.story_url,
                            author: h.author,
                            createdAt: new Date(h.created_at),
                        }))
                    );
                    setCurrPage(1);
                    fetchedCurr.current = true;
                    numPages.current = res.nbPages;
                });
        }, 750);
    }, [query]);

    const handleScroll = (props: ListOnScrollProps) => {
        if (currPage === numPages.current || fetching.current) return;

        if (props.scrollOffset > postHeight * 20 * currPage * 0.8) {
            setCurrPage(currPage + 1);
            fetchedCurr.current = false;
        }

        if (!fetchedCurr.current) {
            fetching.current = true;
            fetch(
                `https://hn.algolia.com/api/v1/search?page=${currPage}&query=${query
                    .split(/s+/)
                    .map((q) => encodeURIComponent(q))
                    .join("+")}`
            )
                .then((res) => res.json())
                .then((res) => {
                    setResults([
                        ...results,
                        ...res.hits.map((h: any) => ({
                            id: h.objectID,
                            title: h.title ? h.title : h.story_title,
                            url: h.url ? h.url : h.story_url,
                            author: h.author,
                            createdAt: new Date(h.created_at),
                        })),
                    ]);
                    setCurrPage(currPage + 1);
                    fetchedCurr.current = true;
                    fetching.current = false;
                });
        }
    };

    const Post = ({ index, style }: { index: number; style: any }) => {
        const post = results[index];
        return (
            <div style={style} className="p-4 md:p-16">
                <div className="flex rounded-lg h-56 p-8 flex-col justify-center text-blue dark:text-beige">
                    <h1 className="text-2xl my-4 w-full">{post.title}</h1>
                    <p>
                        by <em>{post.author}</em> on{" "}
                        <em>{post.createdAt.toDateString()}</em>
                    </p>
                    <a href={post.url}>{post.url}</a>
                    <Link
                        href={{
                            pathname: "/[id]",
                            query: { id: post.id },
                        }}
                    >
                        <a className="w-full text-center my-4">View Post</a>
                    </Link>
                </div>
                <style jsx>{`
                    div > div {
                        background: var(--beige);
                        box-shadow: 8px 8px 16px #d4cab9, -8px -8px 16px #fff6e3;
                    }

                    a {
                        overflow-wrap: anywhere;
                    }

                    @media (prefers-color-scheme: dark) {
                        div > div {
                            background: var(--blue);
                            box-shadow: 8px 8px 16px #033137,
                                -8px -8px 16px #033b43;
                        }
                    }
                `}</style>
            </div>
        );
    };

    return (
        <div className="h-screen w-screen flex flex-col items-center">
            <div className="max-w-6xl w-full flex flex-col justify-center items-center p-8">
                <div className="flex flex-col items-center w-full">
                    <Input
                        label="query"
                        value={query}
                        onChange={handleInputChange}
                    />
                </div>
                <List
                    height={720}
                    itemCount={results.length}
                    itemSize={postHeight}
                    width="100%"
                    onScroll={handleScroll}
                >
                    {Post}
                </List>
            </div>
        </div>
    );
};

export default Home;
