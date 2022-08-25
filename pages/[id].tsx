import { NextPage } from "next";
import Head from "next/head";
import { useRef, useState } from "react";

const zeroPad = (n: number) => {
    return n < 10 ? `0${n}` : n;
};

interface IComment {
    id: string;
    author: string;
    createdAt: Date;
    text: string;
    comments: IComment[];
}

const Comment = ({ comment }: { comment: IComment }) => {
    const [hide, sethide] = useState(false);

    const createdAt = new Date(comment.createdAt);

    const toggleHidden = () => {
        sethide(!hide);
    };

    return (
        <div className="w-11/12 ml-auto sm:ml-12 md:ml-20 my-8">
            <p className="text-slate-600 dark:text-gray-400 my-2">
                <em>{comment.author}</em> at{" "}
                <em>
                    {createdAt.toDateString()} {zeroPad(createdAt.getHours())}:
                    {zeroPad(createdAt.getMinutes())}
                </em>
                <button className="mx-4" onClick={toggleHidden}>
                    [{hide ? "+" : "-"}]
                </button>
            </p>
            <div
                dangerouslySetInnerHTML={{
                    __html: comment.text,
                }}
                hidden={hide}
            ></div>
            <div hidden={hide}>
                {comment.comments.map((c, i) => (
                    <Comment key={c.id} comment={c} />
                ))}
            </div>
        </div>
    );
};

interface IPost {
    title: string;
    author: string;
    createdAt: Date;
    text: string;
    comments: IComment[];
}

interface Props {
    post: IPost | null;
}

const Post: NextPage<Props> = (props) => {
    const { post } = props;
    if (!post) return <div className="h-screen w-screen flex justify-center items-center"><p className="text-center text-6xl">404</p></div>;
    const createdAt = new Date(post.createdAt);

    return (
        <>
            <Head>
                <title>{post.title}</title>
            </Head>
            <div className="h-screen w-screen overflow-auto">
            <div className="px-12 py-8">
                <h1 className="text-2xl my-4">{post.title}</h1>
                <p className="my-4 text-slate-600 dark:text-gray-400 my-2">
                    <em>{post.author}</em> at{" "}
                    <em>
                        {createdAt.toDateString()}{" "}
                        {zeroPad(createdAt.getHours())}:
                        {zeroPad(createdAt.getMinutes())}
                    </em>
                </p>
                <div
                    dangerouslySetInnerHTML={{
                        __html: post.text,
                    }}
                ></div>
                <div>
                    {post.comments.map((c, i) => (
                        <Comment key={c.id} comment={c} />
                    ))}
                </div>
            </div>
            </div>
        </>
    );
};

const prettierComments = (comments: any[]): IComment[] => {
    return comments.map((c: any) => {
        return {
            id: c.id,
            author: c.author,
            createdAt: c.created_at,
            text: c.text,
            comments: prettierComments(c.children),
        };
    });
};

Post.getInitialProps = async (ctx) => {
    const id = ctx.query.id;

    const res = await fetch(`https://hn.algolia.com/api/v1/items/${id}`);

    const data = await res.json();

    if (data.error) {
        return {
            post: null,
        };
    }

    const comments = prettierComments(data.children);

    return {
        post: {
            title: data.title,
            author: data.author,
            createdAt: data.created_at,
            text: data.text,
            comments,
        },
    };
};

export default Post;
