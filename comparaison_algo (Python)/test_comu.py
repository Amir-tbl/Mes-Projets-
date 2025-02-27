#!/usr/bin/python3


from comu import *

reseau = {
    'Alice': ['Bob', 'Dan'],
    'Bob': ['Alice', 'Carl', 'Dan'],
    'Dan': ['Alice', 'Bob'],
    'Carl': ['Bob']
}

#assert 3: 


def test_liste_personnes():
	assert liste_personnes(reseau) == ["Alice", "Bob", "Dan", "Carl"]
	print("Tous les tests sont corrects pour la fonction liste_personnes.")

test_liste_personnes()



#assert 4:

def test_sont_amis():
	#1 : Alice et Bob sont amis
	assert sont_amis("Alice", "Bob", reseau) == True
	
	# 2: Alice et Carl ne sont pas amis
	assert sont_amis("Alice", "Carl", reseau) == False
	
	# 3 : Carl et Bob sont amis
	assert sont_amis("Carl", "Bob", reseau) == True
	print("Tous les tests sont corrects pour la fonction sont_amis.")


test_sont_amis()




#assert 5


def test_sont_amis_de():
	# Cas 1 : Alice est amie avec tous les membres du groupe ["Bob", "Dan"]
	groupe_test = ["Bob", "Dan"]
	assert sont_amis_de("Alice", groupe_test, reseau) == True
	# Cas 2 : Alice n'est pas amie avec tous les membres du groupe ["Bob", "Carl"]
	groupe_test = ["Bob", "Carl"]
	assert sont_amis_de("Alice", groupe_test, reseau) == False
	# Cas 3 : Carl est amie avec tous les membres du groupe ["Bob"]
	groupe_test = ["Bob"]
	assert sont_amis_de("Carl", groupe_test, reseau) == True
	print("la fonction sont_amis_de est correcte")
    
test_sont_amis_de()



#assert 6:
def test_est_comu():

	# 1 : Le groupe ["Alice", "Bob", "Dan"] est une communauté
	groupe = ["Alice", "Bob", "Dan"]
	assert est_comu(groupe, reseau) == True

	# 2 : Le groupe ["Alice", "Bob", "Carl"] n'est pas une communauté
	groupe = ["Alice", "Bob", "Carl"]
	assert est_comu(groupe, reseau) == False

	#3 : Le groupe ["Carl", "Bob"] est une communauté
	groupe = ["Carl", "Bob"]
	assert est_comu(groupe, reseau) == True

	print("la fonction est_comu est correcte")

test_est_comu()

#assert 7
def test_comu():

	#1 : Un groupe où tout le monde peut rejoindre la communauté
	groupe = ["Carl", "Alice", "Bob", "Dan"]
	resu = ["Carl", "Bob"]
	assert comu(groupe, reseau) == resu

	# 2 : Un groupe où une seule personne forme la communauté
	groupe = ["Carl", "Dan"]
	resu = ["Carl"]
	assert comu(groupe, reseau) == resu


	#3 : Un groupe où personne ne peut rejoindre la communauté
	groupe = ["Carl", "Dan", "Eve"]
	resu = ["Carl"]
	assert comu(groupe, reseau) == resu

	print("la fonction comu est correcte")

test_comu()



#Assert 8




def test_tri_popu(): 
#verification du classement des plus populaires
	assert tri_popu(["Alice", "Carl", "Dan"], reseau) == ['Alice', 'Dan', 'Carl']
	assert tri_popu(["Alice", "Bob", "Dan"], reseau) == ["Bob", "Alice", "Dan"]
	print("la fonction tri_popu est correcte")

test_tri_popu()





#Assert 9


def test_comu_dans_reseau() :
	assert comu_dans_reseau(reseau) == ['Bob', 'Alice', 'Dan']
	print("la fonction comu_dans_reseau est correcte")

test_comu_dans_reseau()	
	
#Assert 10

def test_comu_dans_amis():
	assert comu_dans_amis("Carl", reseau) == ["Carl", "Bob"]
	assert comu_dans_amis("Alice", reseau) == ["Alice", "Bob", "Dan"]
	print("la fonction comu_dans_amis est correcte")
	
test_comu_dans_amis()

#Assert 12

def test_comu_max():
	assert comu_max(reseau) == ['Alice', 'Bob', 'Dan']
	print("la fonction comu_max est correcte")
	
