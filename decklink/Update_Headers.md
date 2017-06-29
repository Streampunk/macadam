# Updating C++ headers on Decklink version update

These notes document the process of upgrading the C++ header files to a new version
of the Decklink SDK.

## Install the latest Blackmagic Desktop Video

The first step is to install the latest version of the Blackmagic Desktop Video from https://www.blackmagicdesign.com/support. Note that a new version of firmware may be installed on devices by this update that might not be compatible with older versions.

## Install the latest Blackmagic SDK

Also from https://www.blackmagicdesign.com/support, download the latest Blackmagic Decklink SDK. Copy over the `Mac/include`, `Win/include` and `Linux/include` folders into this folder.

## For Windows, create the C++ headers

1. Run up the _Visual Studio x64 Native Tools Command Prompt_.
2. `cd <macadam>\decklink\Win\include`
3. `midl /h DeckLinkAPI.h DeckLinkAPI.idl`

Remove the `DeckLinkAPI.tbl` file. Note that the `DeckLinkAPI_i.c` file is used as part of the compile.
