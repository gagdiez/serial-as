# Encoder / Decoder AS

encoder-as aims to create an user-friendly interface to implement serialized encoder-decoders for the assemblyscript language. A serialized encoder is that which iterates through the fields of a well-defined Object and encodes its values into a pre-defined encoding type. A serialized decoder knows how to take a serialized object and transform it back into its decoded form.

**encoder-as** simplifies creating a serialized encoder-decoder by taking care of 'walking' through the object, and providing developers with two classes: Encoder and Decoder. The developer then simply needs to extend such classes and implement its abstract methods, indicating how basic types (number, string, array, ...) should be encoded.

## WIP
**Encoder**
- [x] Decide on Encoder's interface
  - [x] Draft
  - [x] Final form
- [x] Implement Transform
  - [x] Draft
  - [x] Final form
- [ ] Implement JSON Encoder
  - [x] Encode Basic types
    - [x] number, string
    - [x] array
    - [x] objects
    - [x] set, map
    - [x] nullables
  - [x] Basic testing
  - [ ] Thoughtful testing
- [ ] Implement Borsh Encoder
  - [x] Encode Basic types
    - [x] number, string
    - [x] array
    - [x] objects
    - [x] set, map
    - [x] nullables
  - [x] Basic testing
  - [ ] Thoughtful testing

**Decoder**
- [ ] Decide on Decoder's interface
  - [x] Draft
  - [ ] Final form
- [ ] Implement Transform
  - [x] Draft
  - [ ] Final form
- [ ] Implement JSON Decoder
  - [ ] Decode Basic types
    - [ ] number, string
    - [ ] array
    - [ ] objects
    - [ ] set, map
    - [ ] nullables
  - [ ] Basic testing
  - [ ] Thoughtful testing
- [ ] Implement Borsh Decoder
  - [x] Decode Basic types
    - [x] number, string
    - [x] array
    - [x] objects
    - [x] set, map
    - [x] nullables
  - [ ] Basic testing
  - [ ] Thoughtful testing

