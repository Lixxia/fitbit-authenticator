import { COLORS,FONTS,DEFAULT_SETTINGS } from "../common/globals.js";

function setDefaults(props) {
  for (let key in DEFAULT_SETTINGS) {
    if (!props.settings[key]) {
      props.settingsStorage.setItem(key, JSON.stringify(DEFAULT_SETTINGS[key]));
    }
  }
};

function mySettings(props) {
  setDefaults(props);
 
  return (
    <Page>
      <Section title={<Text bold align="center">Tokens</Text>}
        description={
          <Section>
            <Text bold align="center">Entry Format</Text>
            <Text align="center">Names of tokens must be unique. All tokens must be entered in the format <Text italic>name</Text><Text bold>:</Text><Text italic>base32token</Text>, the colon delimeter must exist.</Text>
            <Text align="center">Invalid formatting or tokens will result in the item being rejected.</Text>
            <Text align="center"> Items can be reordered in the settings. </Text>
            <Text bold align="center">Security Considerations</Text>
            <Text align="center">Any secret tokens entered are stored directly on the phone. Once stored they are stripped from the displayed settings so that they are no longer viewable. If the token is still visible in the settings, reload the watch app and it should update.</Text>
            <Text align="center">New tokens are transmitted to the watch every 30s.</Text>
            <Text align="center">If the application is uninstalled from the watch, all associated data is permanently deleted. Please consider this before using this as your only means of accessing your tokens.</Text>
          </Section>
        }>
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
      </Section>
      
      <Section
        title={<Text bold align="center">Appearance</Text>}>
        <Toggle
          settingsKey="display_always"
          label="Always on display"
        />
        <Toggle
          settingsKey="text_toggle"
          label="Show Text Counter"
        /> 
        <Select
          label="Font Style"
          settingsKey="font"
          options={FONTS}
        />
        <Select
          label="Token Display Grouping"
          settingsKey="groups"
          options={[
            {name: "None (123456)", value:"1"},
            {name: "Two (123 456)", value: "2"},
            {name: "Three (12 34 56)", value: "3"}
          ]}
        />
        <ColorSelect
            title="Font Color"
            settingsKey="color"
            colors={COLORS}
        />
      </Section>
      
      <Section title={<Text bold align="center">[EXPERIMENTAL] Standalone Mode</Text>}>
        <Text>This mode will instead display a list of all token names on the watch. Upon selecting a name, a token will be calculated locally on the watch and displayed.</Text>
        <Text>Due to the device constraints only one token can be displayed/calculated at a time. There will be a delay of several seconds until the token is calculated.</Text>
        <Text>Adding, deleting and reordering tokens is still managed by the settings page and a connection must be established in order to transmit the data.</Text>
        <Text>Some settings changes may not be applied until the next 30 second interval.</Text>
        <Text>The app is frozen during generation of tokens, due to this the progress bar is not calculated correctly. Recommended that this mode is used with the text counter.</Text>
        <Toggle
          settingsKey="standalone"
          label="Standalone Mode"
        /> 
      </Section>
      
      <Section title={<Text bold align="center">Support</Text>}>
        <Text>In some cases the companion may be unable to communicate with the watch. It's best to reopen the app/companion if this happens.</Text>
        <Text>If you experience any problems please contact me or create an issue on github!</Text>
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