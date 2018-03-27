function mySettings(props) {
  return (
    <Page>
      <AdditiveList
        title="Tokens"
        settingsKey="token_list"
        maxItems="10"
        description="Description"
        addAction={
          <TextInput
            title="Add Token"
            label="New Token"
            placeholder="user@localhost:BASE32TOKEN"
            action="Add Token"
          />
        }
      />
      </Page>
  );
}

registerSettingsPage(mySettings);
