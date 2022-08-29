import { Injectable } from '@angular/core';
import { SQLite } from '@ionic-native/sqlite/ngx';
import { Platform } from '@ionic/angular';
import { insert } from 'sql-bricks';
import { newPromiseHelper } from 'sql-promise-helper';
import { environment } from '@environments/environment';
import { TableNames } from '@app/_helpers/enums/table-names';
import { Storage } from '@ionic/storage';
import { StorageKeys } from '@app/_helpers/enums/storage-keys';

const DB_NAME = `${environment.dbName}.db`;
const win: any = window;
declare var window;

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private db: any;
  private txHelper: any;
  private LASTEST_DB_VERSION = 2;

  constructor(public platform: Platform, public sqlite: SQLite, private storage: Storage) { }

  /**
   * Crea una nueva transacción
   *
   * @returns new Transaction
   */
  initTransaction() {
    return this.txHelper.newBatchTransaction();
  }

  /**
   * Ejecuta una query, si se pasa una transacción se ejectura dentro de la misma
   *
   * @param query La query a ejectuaa
   * @param bindings Los parametros de la query a ejectuar
   * @param tx La transacción que se está usando
   */
  query(query: string, bindings?: any[], tx?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        bindings = typeof bindings !== 'undefined' ? bindings : [];

        if (tx !== undefined) {
          tx.executeStatement(query, bindings);
          resolve();
        } else {
          resolve(this.txHelper.executeStatement(query, bindings));
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Obtiene la primer fila del objecto devuelto por la query a la base de datos
   *
   * @param result El objecto devuelto por la query a la base de datos
   * @returns La primer fila o null si no hay resultados
   */
  getFirst(result: any): any | undefined {
    if (result.rows.length !== 0) {
      const item = result.rows.item(0);
      for (const key in item) {
        if (item.hasOwnProperty(key)) {
          item[key] = item[key];
        }
      }
      return item;
    } else {
      return undefined;
    }
  }

  /**
   * Obtiene todas las filas del objecto devuelto por la query a la base de datos
   *
   * @param result El objecto devuelto por la query a la base de datos
   * @returns Las filas obtenidas del resultado de la query
   */
  getAll(result: any): any[] {
    const output = [];
    for (let i = 0; i < result.rows.length; i++) {
      const item = result.rows.item(i);
      for (const key in item) {
        if (item.hasOwnProperty(key)) {
          item[key] = item[key];
        }
      }
      output.push(item);
    }
    return output;
  }

  /**
   * Inserta 1 registro en la base de datos
   *
   * @param table La tabla a insertar el registro
   * @param columns Las columnas de la tabla
   * @param values Los valores a insertar
   * @param tx La transacción en la cual ejectuar la query
   */
  insert(table: string, columns: string[], values: any[], tx?: any): Promise<any> {
    const query = insert(table, columns).values(values).toParams();
    return this.query(query.text, query.values, tx);
  }

  /**
   * Inserta varios registros en la base de datos
   *
   * @param table La tabla a insertar los registros
   * @param columns Las columnas de la tabla
   * @param valuesArray Los valores a insertar
   * @param tx La transacción en la cual ejectuar la query
   */
  insertBulk(table: string, columns: string[], valuesArray: any[], tx?: any): Promise<any> {
    const query = insert(table, columns).values(valuesArray).toParams();
    return this.query(query.text, query.values, tx);
  }

  /**
   * Inserta o reemplaza 1 registro en la base de datos
   *
   * @param table La tabla a insertar el registro
   * @param columns Las columnas de la tabla
   * @param values Los valores a insertar
   * @param tx La transacción en la cual ejectuar la query
   */
  insertOrReplace(table: string, columns: string[], values: any[], tx?: any): Promise<any> {
    const colVals = columns.map((item, index) => {
      return '?';
    }).join(',');
    const query = `INSERT OR REPLACE INTO ${table} (${columns.join(',')}) VALUES (${colVals})`;
    return this.query(query, values, tx);
  }

  /**
   * Borrar registros por id
   *
   * @param table La tabla en la cual realizar el borrado
   * @param id El ID del registro a borrar
   * @param tx La transacción en la cual ejectuar la query
   */
  deleteById(table: string, id: number, tx?: any): Promise<any> {
    const statement = 'DELETE FROM ' + table + ' WHERE id = ?';
    return this.query(statement, [id], tx);
  }

  /**
   * Crea una nueva table si no existe
   *
   * @param tableName Nombre de la tabla
   * @param columnsDefinition Columnas de la tabla
   * @param constraints Constraints de la tabla
   */
  createTableIfNotExists(tx: any, tableName: string, columnsDefinition: string[], constraints?: string[]): Promise<any> {
    const columnsToCreate = columnsDefinition.join(',');
    let constraintsToAdd: string;
    if (constraints) {
      constraintsToAdd = constraints.join(',');
    }
    const statement = `CREATE TABLE IF NOT EXISTS ${tableName}
    (
      ${columnsToCreate}
      ${constraints ? ',' + constraintsToAdd : ''}
    )`;
    return this.query(statement, undefined, tx);
  }

  addColumn(table: string, columnName: string, columnDefinition: string) {
    return `ALTER TABLE ${table} ADD COLUMN ${columnName} ${columnDefinition}`;
  }

  booleanToInteger(value: boolean) {
    return value ? 1 : 0;
  }

  integerToBoolean(value: number) {
    return value === 1 ? true : false;
  }

  /**
   * Crea/Abre la conexión a la base de datos y genera la estructura de la misma
   */
  initDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.openDatabase()
        .then(async () => {
          const tx = this.txHelper.newBatchTransaction();

          await this.createTableIfNotExists(tx, TableNames.TIPO_USUARIO, ['id INTEGER PRIMARY KEY AUTOINCREMENT', 'descripcion TEXT NOT NULL']);

          await this.createTableIfNotExists(tx, TableNames.CARGO, ['id INTEGER PRIMARY KEY AUTOINCREMENT', 'descripcion TEXT NOT NULL']);

          await this.createTableIfNotExists(tx, TableNames.CARGO_CONTRATISTA, ['id INTEGER PRIMARY KEY AUTOINCREMENT', 'descripcion TEXT NOT NULL']);

          await this.createTableIfNotExists(tx, TableNames.GERENCIA, ['id INTEGER PRIMARY KEY AUTOINCREMENT', 'descripcion TEXT NOT NULL']);

          await this.createTableIfNotExists(tx, TableNames.MODULO, ['id INTEGER PRIMARY KEY AUTOINCREMENT', 'descripcion TEXT NOT NULL']);

          await this.createTableIfNotExists(tx, TableNames.UNIDAD_NEGOCIO, ['id INTEGER PRIMARY KEY AUTOINCREMENT', 'descripcion TEXT NOT NULL']);

          await this.createTableIfNotExists(
            tx,
            TableNames.EMPRESA,
            ['id INTEGER PRIMARY KEY AUTOINCREMENT', 'cuit TEXT NULL', 'razon_social TEXT NOT NULL', 'rubro TEXT NULL', 'es_contratista BOOLEAN NOT NULL'],
            ['CHECK (es_contratista IN (0,1))']
          );

          await this.createTableIfNotExists(
            tx,
            TableNames.AREA_TRABAJO,
            ['id INTEGER PRIMARY KEY AUTOINCREMENT', 'descripcion TEXT NOT NULL', 'sigla TEXT NOT NULL', 'unidad_negocio_id INTEGER NOT NULL'],
            [`FOREIGN KEY(unidad_negocio_id) REFERENCES ${TableNames.UNIDAD_NEGOCIO}(id)`]
          );

          await this.createTableIfNotExists(
            tx,
            TableNames.YACIMIENTO,
            ['id INTEGER PRIMARY KEY AUTOINCREMENT', 'descripcion TEXT NOT NULL', 'area_trabajo_id INTEGER NOT NULL'],
            [`FOREIGN KEY(area_trabajo_id) REFERENCES ${TableNames.AREA_TRABAJO}(id)`]
          );

          await this.createTableIfNotExists(
            tx,
            TableNames.LUGAR_ESPECIFICO,
            ['id INTEGER PRIMARY KEY AUTOINCREMENT', 'descripcion TEXT NOT NULL', 'yacimiento_id INTEGER NOT NULL'],
            [`FOREIGN KEY(yacimiento_id) REFERENCES ${TableNames.YACIMIENTO}(id)`]
          );

          await this.createTableIfNotExists(tx, TableNames.CHECKLIST_CABECERA, ['id INTEGER PRIMARY KEY AUTOINCREMENT', 'nombre TEXT NOT NULL']);

          await this.createTableIfNotExists(
            tx,
            TableNames.CHECKLIST_CABECERA_GRUPO,
            ['id INTEGER PRIMARY KEY AUTOINCREMENT', 'checklist_cabecera_id INTEGER NOT NULL', 'nombre TEXT NOT NULL', 'numero INTEGER NOT NULL', 'iconos BOOLEAN NOT NULL'],
            ['CHECK (iconos IN (0,1))', `FOREIGN KEY(checklist_cabecera_id) REFERENCES ${TableNames.CHECKLIST_CABECERA}(id)`]
          );

          await this.createTableIfNotExists(
            tx,
            TableNames.CHECKLIST_CABECERA_GRUPO_ITEM,
            ['id INTEGER PRIMARY KEY AUTOINCREMENT', 'checklist_cabecera_grupo_id INTEGER NOT NULL', 'titulo TEXT NOT NULL', 'texto TEXT NOT NULL', 'orden INTEGER NOT NULL', 'numerado BOOLEAN NOT NULL', 'icono TEXT NULL', 'imagen TEXT NULL'],
            ['CHECK (numerado IN (0,1))', `FOREIGN KEY(checklist_cabecera_grupo_id) REFERENCES ${TableNames.CHECKLIST_CABECERA_GRUPO}(id)`]
          );

          await this.createTableIfNotExists(
            tx,
            TableNames.INSPECCION_TOP,
            ['id INTEGER PRIMARY KEY AUTOINCREMENT', 'formulario TEXT NOT NULL', 'id_servidor NUMBER NULL', 'fecha_alta DATETIME NOT NULL', 'sincronizado BOOLEAN NOT NULL'],
            ['CHECK (sincronizado IN (0,1))']
          );

          await this.createTableIfNotExists(
            tx,
            TableNames.INSPECCION_TOP_IMAGEN,
            ['id INTEGER PRIMARY KEY AUTOINCREMENT', 'inpseccion_top_id NUMBER NOT NULL', 'imagen TEXT NOT NULL', 'fecha_alta DATETIME NOT NULL', 'sincronizado BOOLEAN NOT NULL'],
            ['CHECK (sincronizado IN (0,1))', `FOREIGN KEY(inpseccion_top_id) REFERENCES ${TableNames.INSPECCION_TOP}(id)`]
          );

          let DATABASE_VERSION: number = await this.storage.get(StorageKeys.DB_VERSION);
          DATABASE_VERSION = DATABASE_VERSION || 1;

          for (
            let index = DATABASE_VERSION;
            index < this.LASTEST_DB_VERSION;
            index++
          ) {
            switch (index) {
              case 1:
                console.log('version 1 a 2');
                await this.query(this.addColumn(TableNames.UNIDAD_NEGOCIO, 'activo', 'BOOLEAN NOT NULL DEFAULT 1'), undefined, tx);
                await this.query(this.addColumn(TableNames.AREA_TRABAJO, 'activo', 'BOOLEAN NOT NULL DEFAULT 1'), undefined, tx);
                await this.query(this.addColumn(TableNames.YACIMIENTO, 'activo', 'BOOLEAN NOT NULL DEFAULT 1'), undefined, tx);
                await this.query(this.addColumn(TableNames.LUGAR_ESPECIFICO, 'activo', 'BOOLEAN NOT NULL DEFAULT 1'), undefined, tx);
                await this.query(this.addColumn(TableNames.GERENCIA, 'activo', 'BOOLEAN NOT NULL DEFAULT 1'), undefined, tx);
                await this.query(this.addColumn(TableNames.EMPRESA, 'activo', 'BOOLEAN NOT NULL DEFAULT 1'), undefined, tx);
                await this.query(this.addColumn(TableNames.CARGO, 'activo', 'BOOLEAN NOT NULL DEFAULT 1'), undefined, tx);
                await this.query(this.addColumn(TableNames.CARGO_CONTRATISTA, 'activo', 'BOOLEAN NOT NULL DEFAULT 1'), undefined, tx);
                await this.storage.set(StorageKeys.DB_VERSION, 2);
                break;

              default:
                break;
            }
          }

          tx.commit()
            .then(() => {
              resolve();
            })
            .then(null, error => {
              console.log(error);
              reject(error);
            });
        }).catch(err => {
          console.log(err);
          reject(err);
        });
    });
  }

  /**
   * Crea/Abre la conexión a la base de datos
   */
  private openDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (this.platform.is('desktop')) {
          /*this.logger.debug(
            "Storage: SQLite no se encuentra instalado. Se utlizará WebSQL."
          );*/
          this.db = win.openDatabase(DB_NAME, '1.0', 'database', 5 * 1024 * 1024);
          this.txHelper = newPromiseHelper(this.db);
          resolve();
        } else {
          this.sqlite
            .create({
              name: DB_NAME,
              location: 'default', // the location field is required
            })
            .then(db => {
              this.db = db;
              this.txHelper = newPromiseHelper(db);
              resolve();
            })
            .catch(error => {
              reject(error);
            });
        }
      } catch (error) {
        reject(error);
      }
    });
  }
}
