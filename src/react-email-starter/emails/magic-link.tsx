import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";
import { tailwindConfig } from "../tailwind.config";

interface MacGamingDBMagicLinkEmailProps {
  magicLink?: string;
}

export const MacGamingDBMagicLinkEmail = ({
  magicLink,
}: MacGamingDBMagicLinkEmailProps) => (
  <Html>
    <Head />
    <Preview>Log in to MacGamingDB with this magic link</Preview>
    <Tailwind config={tailwindConfig}>
      <Body
        className="bg-dark font-sans"
        /**
         * Override dark mode background colors
         * https://litmus.com/community/snippets/267-override-dark-mode-background-colors-annett-forcier
         */
        style={{
          background: "linear-gradient(#000000, #000000)",
          backgroundColor: "#000000",
        }}
      >
        <Container className="mx-auto py-5 pb-12 max-w-xl px-3">
          <Heading className="text-2xl tracking-tight leading-tight font-bold text-white pt-4 my-10">
            Login to 🎮 MacGamingDB
          </Heading>
          <Section className="py-7">
            <Button
              className="bg-primary rounded font-semibold text-white text-sm no-underline text-center block py-3 px-6"
              href={magicLink || "https://macgamingdb.app/login"}
            >
              Log in with this magic link
            </Button>
          </Section>
          <Text className="my-0 mb-4 text-sm leading-relaxed text-white">
            Or, copy this link to your browser:
          </Text>
          <code className="font-mono font-bold p-3 bg-gray-dark tracking-tight text-sm rounded text-white border border-gray-medium block break-all">
            {magicLink}
          </code>
          <br />
          <Text className="my-0 mb-4 text-sm leading-relaxed text-white">
            If you didn&apos;t try to login to share your game experience, you
            can safely ignore this email.
          </Text>
          <Text className="my-0 mb-4 text-sm leading-relaxed text-white">
            After logging in, you'll be able to add your experience reports for
            Mac games.
          </Text>
          <Hr className="border-gray-medium my-11 mt-7" />
          <Link
            href="https://macgamingdb.app"
            className="text-xs text-gray-light"
          >
            MacGamingDB.app, the community-driven database for gaming
            experiences on Mac.
          </Link>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

MacGamingDBMagicLinkEmail.PreviewProps = {
  magicLink: "https://macgamingdb.app/login?token=example-token-12345",
} as MacGamingDBMagicLinkEmailProps;

export default MacGamingDBMagicLinkEmail;
