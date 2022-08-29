import { Entry } from '@ionic-native/file/ngx';

export interface Photo {
  filepath: string;
  directory: string;
  filename: string;
  base64: string;
  file: Entry;
  localId?: number;
}
