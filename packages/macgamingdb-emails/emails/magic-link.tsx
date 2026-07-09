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
} from '@react-email/components';
import { tailwindConfig } from '../tailwind.config';

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
          background: 'linear-gradient(#000000, #000000)',
          backgroundColor: '#000000',
        }}
      >
        <Container className="mx-auto py-12 px-3 max-w-2xl">
          <Heading className="text-4xl tracking-tight leading-tight font-bold text-white">
            Login to 🎮 MacGamingDB
          </Heading>
          <Section>
            <Button
              className="bg-primary rounded font-semibold text-white no-underline text-center block py-3 px-6"
              href={magicLink || 'https://macgamingdb.app/login'}
            >
              Log in with this magic link
            </Button>
          </Section>
          <Text className="mb-4 leading-relaxed text-white opacity-90">
            Or, copy this link to your browser:
          </Text>
          <Section className="font-mono font-bold p-3.5 bg-[#272727] tracking-tight rounded-[5px] text-white border border-[#333333] block break-all">
            {magicLink}
          </Section>
          <Text className="mb-4 leading-relaxed text-white opacity-90">
            If you didn&apos;t try to login to share your game experience, you
            can safely ignore this email.
          </Text>
          <Text className="mb-8 leading-relaxed text-white opacity-90">
            After logging in, you'll be able to add your experience reports for
            Mac games.
          </Text>
          <Hr className="border-gray-medium h-[0.5px] opacity-40" />
          <Link
            href="https://macgamingdb.app"
            className="text-sm text-gray-light"
          >
            MacGamingDB.app, the community-driven database for gaming
            experiences on Mac.
          </Link>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

export const MacGamingDBMagicLinkEmailText = ({
  magicLink,
}: MacGamingDBMagicLinkEmailProps): string => {
  return `Login to 🎮 MacGamingDB

Log in with this magic link: ${magicLink}

If you didn't try to login to share your game experience, you can safely ignore this email.

After logging in, you'll be able to add your experience reports for Mac games.

--
MacGamingDB.app, the community-driven database for gaming experiences on Mac.
https://macgamingdb.app`;
};

MacGamingDBMagicLinkEmail.PreviewProps = {
  magicLink: 'https://macgamingdb.app/login?token=example-token-12345',
} as MacGamingDBMagicLinkEmailProps;
