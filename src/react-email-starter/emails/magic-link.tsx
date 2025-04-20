import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface MacGamingDBMagicLinkEmailProps {
  magicLink?: string;
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "";

export const MacGamingDBMagicLinkEmail = ({
  magicLink,
}: MacGamingDBMagicLinkEmailProps) => (
  <Html>
    <Head />
    <Preview>Log in to MacGamingDB with this magic link</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={heading}>Login to 🎮 MacGamingDB</Heading>
        <Section style={buttonContainer}>
          <Button
            style={button}
            href={magicLink || "https://macgamingdb.com/login"}
          >
            Log in with this magic link
          </Button>
        </Section>
        <Text style={paragraph}>Or, copy this link to your browser:</Text>
        <code style={code}>{magicLink}</code>
        <br />
        <Text style={paragraph}>
          If you didn&apos;t try to login to share your game experience, you can
          safely ignore this email.
        </Text>
        <Text style={paragraph}>
          After logging in, you'll be able to add your experience reports for
          Mac games.
        </Text>
        <Hr style={hr} />
        <Link href="https://macgamingdb.com" style={reportLink}>
          MacGamingDB.com, the community-driven database for gaming experiences
          on Mac.
        </Link>
      </Container>
    </Body>
  </Html>
);

MacGamingDBMagicLinkEmail.PreviewProps = {
  magicLink: "https://macgamingdb.com/login?token=example-token-12345",
} as MacGamingDBMagicLinkEmailProps;

export default MacGamingDBMagicLinkEmail;

const main = {
  backgroundColor: "#000000",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "560px",
  paddingLeft: "12px",
  paddingRight: "12px",
};

const heading = {
  fontSize: "24px",
  letterSpacing: "-0.5px",
  lineHeight: "1.3",
  fontWeight: "bold",
  color: "#ffffff",
  padding: "17px 0 0",
  margin: "40px 0",
};

const paragraph = {
  margin: "0 0 15px",
  fontSize: "14px",
  lineHeight: "1.4",
  color: "#ffffff",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
};

const buttonContainer = {
  padding: "27px 0 27px",
};

const button = {
  backgroundColor: "#3b82f6",
  borderRadius: "5px",
  fontWeight: "600",
  color: "#ffffff",
  fontSize: "14px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px 23px",
};

const reportLink = {
  fontSize: "12px",
  color: "#898989",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
};

const hr = {
  borderColor: "#333333",
  margin: "42px 0 26px",
};

const code = {
  fontFamily: "monospace",
  fontWeight: "700",
  padding: "12px",
  backgroundColor: "#272727",
  letterSpacing: "-0.3px",
  fontSize: "14px",
  borderRadius: "5px",
  color: "#ffffff",
  border: "1px solid #333333",
  display: "block",
  wordBreak: "break-all" as const,
};
