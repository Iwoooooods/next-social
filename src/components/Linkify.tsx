import { LinkItUrl, LinkIt } from "react-linkify-it";
import Link from "next/link";

interface LinkifyProps {
  children: React.ReactNode;
}

export default function Linkify({ children }: LinkifyProps) {
  return (
    <LinkifyHashtag>
      <LinkifyUsername>
        <LinkifyUrl>{children}</LinkifyUrl>
      </LinkifyUsername>
    </LinkifyHashtag>
  );
}

function LinkifyUrl({ children }: LinkifyProps) {
  return (
    <LinkItUrl className="text-primary hover:underline">{children}</LinkItUrl>
  );
}

function LinkifyUsername({ children }: LinkifyProps) {
  return (
    <LinkIt
      regex={/(@[a-zA-Z0-9_-]+)/}
      component={(match, key) => {
        const username = match.replace("@", "");
        return (
          <Link
            key={key}
            href={`/users/${username}`}
            className="text-primary hover:underline"
          >
            {match}
          </Link>
        );
      }}
    >
      {children}
    </LinkIt>
  );
}

function LinkifyHashtag({ children }: LinkifyProps) {
  return (
    <LinkIt
      regex={/(#[a-zA-Z0-9]+)/}
      component={(match, key) => {
        const hashtag = match.replace("#", "");
        return (
          <Link
            key={key}
            href={`/hashtags/${hashtag}`}
            className="text-primary hover:underline"
          >
            {match}
          </Link>
        );
      }}
    >
      {children}
    </LinkIt>
  );
}
