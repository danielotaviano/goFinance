import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';
import Transaction from '../models/Transaction';

interface Request {
  title: string;
  value: number;
  type: 'outcome' | 'income';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    // TODO
    const transactionRepository = getCustomRepository(TransactionsRepository);

    const { total } = await transactionRepository.getBalance();

    if (type === 'outcome' && total < value)
      throw new AppError('Insufficient funds');

    const categoryRepository = getRepository(Category);

    const isAlreadyExistCategory = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!isAlreadyExistCategory) {
      const newCategory = await categoryRepository.create({ title: category });
      await categoryRepository.save(newCategory);
      const transaction = await transactionRepository.create({
        title,
        value,
        type,
        category_id: newCategory.id,
      });

      await transactionRepository.save(transaction);

      return transaction;
    }
    const transaction = await transactionRepository.create({
      title,
      value,
      type,
      category_id: isAlreadyExistCategory.id,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
