class MultiInput extends SettingsComponent {
  state = {
    name: undefined,
    token: undefined
  };

  render() {
    return (
      <Section _noWrap>
        <TextInput
          action="Enter Name"
          label="Enter Name"
          placeholder="Name"
          onChange={({ name }) => this.setState({ name })}
        />
        <TextInput
          action="Enter Token"
          label="Enter Token"
          placeholder="Token"
          onChange={({ token }) => this.setState({ token })}
        />
        {
          (this.state.name && this.state.token) && (
            <Button
              label="Save"
              onClick={() => this.setState(({ name, token }) => {
                this.props.onChange({
                  name: `${name}:${token}`
                });
                return {
                  name: undefined,
                  token: undefined
                };
              })}
            />
          )
        }
      </Section>
    );
  }
}


class CustomAdditiveList extends SettingsComponent {

  render() {
    return (
      <Page>

        <AdditiveList
          title="Custom addAction Test"
          description="Testing custom addAction"
          settingsKey="token_list"
          maxItems="5"
          addAction={
            <MultiInput />
          }
        />

      </Page>
    );
  }
}

registerSettingsPage(CustomAdditiveList);

//base code provided by Chapel on fitbit discord
