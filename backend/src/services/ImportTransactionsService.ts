/* eslint-disable guard-for-in */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import fs from 'fs';
import parse from 'csv-parse/lib/sync';
import { getRepository } from 'typeorm';
import Transaction from '../models/Transaction';

import Category from '../models/Category';

interface AddTransaction {
  title: string;
  type: 'outcome' | 'income';
  value: number;
  category: string;
}

interface Request {
  file: Express.Multer.File;
}

class ImportTransactionsService {
  async execute({ file }: Request): Promise<Transaction[]> {
    // TODO

    const categoriesRepository = getRepository(Category);
    const transactionsRepository = getRepository(Transaction);

    const csvBuffer = fs.readFileSync(file.path);

    const transactions: AddTransaction[] = [];
    const existentCategories = (await categoriesRepository.find()).map(
      category => category.title,
    );

    const records = parse(csvBuffer, { trim: true });
    records.shift();

    for (const index in records) {
      const transaction = records[index];
      const [title, type, value, category] = transaction;

      transactions.push({ title, type, value, category });
    }
    const newCategories = transactions.filter(
      transaction => !existentCategories.includes(transaction.category),
    );

    const finalCategories = await categoriesRepository.create(
      [
        ...new Set(newCategories.map(({ category: title }) => title)),
      ].map(title => ({ title })),
    );
    await categoriesRepository.save(finalCategories);

    const allCategories = await categoriesRepository.find();

    const newTransactions = await transactionsRepository.create(
      transactions.map(({ title, type, value, category }) => ({
        title,
        type,
        value,
        category_id: allCategories.filter(cat => cat.title === category)[0].id,
      })),
    );

    await transactionsRepository.save(newTransactions);
    fs.unlinkSync(file.path);

    return newTransactions;
  }
}

export default ImportTransactionsService;
