import { DataSource, DataSourceOptions } from 'typeorm';

const dataSource_config: DataSourceOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 8884,
  username: 'joli007',
  password: 'jedLa',
  database: 'joli007',
  entities: ['src/entities/*.ts'],
  synchronize: true,
  logging: true,
};

export default dataSource_config;
