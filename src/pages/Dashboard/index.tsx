import React, { useState, useEffect } from 'react';

import Header from '../../components/Header';

import api from '../../services/api';

import Food from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';

import { FoodsContainer } from './styles';

interface IFoodPlate {
  id: number;
  name: string;
  image: string;
  price: string;
  description: string;
  available: boolean;
}

const Dashboard: React.FC = () => {
  const [foods, setFoods] = useState<IFoodPlate[]>([]);
  const [editingFood, setEditingFood] = useState<IFoodPlate>({} as IFoodPlate);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    async function loadFoods(): Promise<void> {
      api.get('/foods').then(response => {
        const foodItems = response.data;
        setFoods(foodItems);
      });
    }

    loadFoods();
  }, []);

  async function handleAddFood(
    food: Omit<IFoodPlate, 'id' | 'available'>,
  ): Promise<void> {
    try {
      const { name, description, price, image } = food;
      const available = true;

      const response = await api.post<IFoodPlate>('/foods', {
        name,
        description,
        price,
        image,
        available,
      });

      const newDish: IFoodPlate = response.data;

      setFoods([...foods, newDish]);
    } catch (err) {
      throw new Error(err);
    }
  }

  async function handleUpdateFood(
    food: Omit<IFoodPlate, 'id' | 'available'>,
  ): Promise<void> {
    const { name, description, price, image } = food;
    const { available, id } = editingFood;

    const response = await api.put<IFoodPlate>(`/foods/${id}`, {
      name,
      description,
      price,
      image,
      available,
      id,
    });

    const foodsUpdated = foods.map(foodOnDashboard => {
      if (foodOnDashboard.id === response.data.id) {
        return {
          ...foodOnDashboard,
          name: response.data.name,
          description: response.data.description,
          price: response.data.price,
          image: response.data.image,
        };
      }
      return foodOnDashboard;
    });

    setFoods(foodsUpdated);
  }

  async function handleFoodSwitchAvailability(food: IFoodPlate): Promise<void> {
    const { id, name, image, price, description } = food;
    const available = !food.available;

    await api.put(`/foods/${food.id}`, {
      id,
      name,
      image,
      price,
      description,
      available,
    });

    const foodsUpdated = foods.map(foodOnDashboard => {
      if (foodOnDashboard.id === id) {
        return {
          ...foodOnDashboard,
          available,
        };
      }
      return foodOnDashboard;
    });

    setFoods(foodsUpdated);
  }

  async function handleDeleteFood(id: number): Promise<void> {
    await api.delete(`/foods/${id}`);

    const foodsUpdated = foods.filter(
      foodOnDashboard => foodOnDashboard.id !== id,
    );

    setFoods(foodsUpdated);
  }

  function toggleModal(): void {
    setModalOpen(!modalOpen);
  }

  function toggleEditModal(): void {
    setEditModalOpen(!editModalOpen);
  }

  function handleEditFood(food: IFoodPlate): void {
    toggleEditModal();
    setEditingFood(food);
  }

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
              handleFoodSwitchAvailability={handleFoodSwitchAvailability}
            />
          ))}
      </FoodsContainer>
    </>
  );
};

export default Dashboard;
