import {COLORS,FONTS} from "../common/globals.js";

function mySettings(props) {
  return (
    <Page>
      <Section title={<Text bold align="center">Tokens</Text>}>
        <AdditiveList
          settingsKey="token_list"
          maxItems="10"
          addAction={
            <TextInput
              title="Add Token"
              label="New Token"
              placeholder="user@localhost:BASE32TOKEN"
              action="Add Token"
            />
          }
        />
        <Text bold align="center">Entry Format</Text>
        <Text align="center">Names of tokens must be unique. All tokens must be entered in the format <Text italic>name</Text><Text bold>:</Text><Text italic>base32token</Text>, the colon delimeter must exist.</Text>
        <Text align="center">Invalid formatting or tokens will result in the item being rejected.</Text>
        <Text bold align="center">Security Considerations</Text>
        <Text align="center">Any tokens entered are transmitted to the watch and stored locally on the device, they are then removed from the phone's storage. They will never be backed up on remote servers or stored on the phone.</Text>
        <Text align="center">If the application is uninstalled from the watch, all associated data is permanently deleted. Please consider this before using this as your only means of accessing your tokens.</Text>
      </Section>
      
      <Section
        title={<Text bold align="center">Appearance</Text>}>
        <Toggle
          settingsKey="text_toggle"
          label="Show Text Counter"
        /> 
        <Select
          label="Font Style"
          settingsKey="font"
          options={FONTS}
        />
        <ColorSelect
            title="Progress Bar Color"
            settingsKey="color"
            colors={COLORS}
        />
      </Section>
      <Section title={<Text bold align="center">Support</Text>}>
        <Link source="https://github.com/Lixxia/fitbit-authenticator">
        <TextImageRow
          label="Github"
          sublabel="Project Source Code"
          icon="https://raw.githubusercontent.com/Lixxia/fitbit-authenticator/master/resources/GitHub-Mark-64px.png"
          />
        </Link>
      </Section>
    </Page>

  );
}

registerSettingsPage(mySettings);