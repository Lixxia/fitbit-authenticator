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

//TODO
//- Add progress bar colors/auto darken background based on input
//- Text colors
//- Optional text counter
//- Font options
//- Documentation/discription of use