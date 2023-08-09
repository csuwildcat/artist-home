
import { toWebStream } from "./streams";

const profileProtocol = 'https://developer.tbd.website/protocols/profile';
const musicianProtocol = 'https://developer.tbd.website/protocols/musician';
const imageDefinition = {
  schema: profileProtocol + '/image',
  "dataFormats":[
    "image/png",
    "image/jpeg",
    "image/gif"
  ]
};

const anyCanQueryRead = [
  // { NOT SUPPORTED YET
  //     "who":"anyone",
  //     "can":"query"
  // },
  {
      "who":"anyone",
      "can":"read"
  }
]

class Datastore {

  constructor(options){
    this.did = options.did;
    this.dwn = options.web5.dwn;
    this.profile = {};
    this.images = {};
    this.ready = new Promise(resolve => {
      this.getProtocol().then(async response => {

        if (response.protocols.length) {
          console.log('existing');
          resolve();
        }
        else {
          console.log('new');
          this.setProtocols().then(z => {
            console.log(z);
            resolve()
          });
        }
      })
    })
  }

  getProtocol(protocol = profileProtocol){
    return this.dwn.protocols.query({
      message: {
        filter: {
          protocol: protocol
        }
      }
    })
  }

  setProtocols(){
    return Promise.all([
        this.dwn.protocols.configure({
          message: {
            definition: {
              protocol: profileProtocol,
              types:{
                social: {
                  schema: profileProtocol + '/social',
                  dataFormats: ["application/json"]
                  /*
                    {
                      displayName: "",
                      tagline: "",
                      bio: "",
                      website: "",
                      apps: {
                        twitter: "",
                        facebook: "",
                        instagram: "",
                        linkedin: "",
                        github: "",
                        tidal: "",
                        ...
                      }
                    }
                  */
                },
                icon: imageDefinition,
                avatar: imageDefinition,
                photo: imageDefinition
              },
              "structure":{
                social: {
                  $actions: anyCanQueryRead
                },
                icon: {
                  $actions: anyCanQueryRead
                },
                avatar: {
                  $actions: anyCanQueryRead
                },
                photo: {
                  $actions: anyCanQueryRead
                }
              }
            }
          }
        }),
        this.dwn.protocols.configure({
          message: {
            definition: {
              protocol: musicianProtocol,
              types: {
                tracks: {
                  schema: musicianProtocol + '/tracks',
                  dataFormats: ['application/json']
                },
                audio: {
                  dataFormats: ['audio/mpeg', 'audio/mp4', 'audio/mp4a']
                }
              },
              structure: {
                tracks: {
                  $actions: anyCanQueryRead
                },
                audio: {
                  $actions: anyCanQueryRead
                }
              }
            }
          }
        })
      ]);
  }

  async getSocialProfile(did){
    if (this.profile.social) return this.profile.social;
    const { records, status } = await this.dwn.records.query({
      from: did,
      message: {
        filter: {
          protocol: profileProtocol,
          // protocolPath: 'social',
          //schema: profileProtocol + '/social',
        }
      }
    });
    console.log(status);
    if (status.code !== 200) return false;
    const record = records[0];
    if (record) {
      this.profile.social = record;
      return record;
    }
  }

  async setSocialProfile(json){
    console.log(globalThis.userDID);
    const record = await this.getSocialProfile(globalThis.userDID);
    console.log(record);
    if (record) {
      return record.update({ data: json })
    }
    else {
      const { record, status } = await this.dwn.records.create({
        data: json,
        message: {
          published: true,
          protocol: profileProtocol,
          protocolPath: 'social',
          schema: profileProtocol + '/social',
          dataFormat: 'application/json'
        }
      });
      console.log(record, status);
      return record;
    }
  }

  async getImage(did, type){
    if (this.images?.[type]) return this.images[type];
    const { records, status } = await this.dwn.records.query({
      message: {
        from: did,
        filter: {
          protocol: profileProtocol,
          schema: profileProtocol + '/image'
        }
      }
    });
    if (status.code !== 200) return false;
    const record = records[0];
    if (record) {
      this.images[type] = record;
      return record;
    }
  }

  async readImage(did, type){
    const record = await this.getImage(did, type);
    if (record) {
      record.blobUrl = URL.createObjectURL(await record.data.blob());
      return record;
    }
    return null;
  }

  async setImage(type, file, format){
    let record = await this.getImage(type);
    if (record) {
      record.update({ data: json })
    }
    else {
      const response = await this.dwn.records.create({
        data: file,
        message: {
          protocol: profileProtocol,
          protocolPath: type,
          dataFormat: format
        }
      });
      record = response.record;
    }
    record.blobUrl = URL.createObjectURL(await record.data.blob());
    return record;
  }

}


export {
  Datastore
}