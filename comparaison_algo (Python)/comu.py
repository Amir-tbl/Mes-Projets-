#!/usr/bin/python3


#Question 1:



def cree_reseau(tab) :
	reseau = {}
	i = 0
	while i < len(tab)/2:
		a = tab[2*i]
		b = tab[2*i+1]
		if a not in reseau : # On vérifie si a est dans le dictionnaire représentant le réseau
        
			reseau[a] = [] # On ajoute la clé et un en valeur un tableau vide si ce n'est pas le cas
            
		if b not in reseau : # On vérifie si b est dans le dictionnaire représentant le réseau
			reseau[b] = []         
		if b not in reseau[a] : # On vérifie si b est dans les dictionnaire amis de a
        
			reseau[a].append(b) # Si ce n'est pas le cas, on l'ajoute a ses amis
             
		if a not in reseau[b] :
			reseau[b].append(a)
		i += 1
	return reseau





# Question 3 :



def liste_personnes(reseau):
	return list(reseau.keys())  # Retourne les clés du dictionnaire, qui sont les noms des personnes
    
    
    
    
    
# Question 4 :*


def sont_amis(personne1, personne2, reseau):

	if personne1 in reseau:  # Vérifie si personne1 est dans le réseau
		if personne2 in reseau[personne1]:  # Vérifie si personne2 est dans la liste des amis de personne1
			return True  # Elles sont amies
	return False  # Elles ne sont pas amies
    
    
    
    
    
# Question 5 :


def sont_amis_de(personne, groupe, reseau):
	for membre in groupe:  # Parcourt tous les membres du groupe
		if not sont_amis(personne, membre, reseau):  # Si la personne n'est pas amie avec un membre, retourne False
			return False
	return True  # Retourne True si la personne est amie avec tout le groupe
    
    
    
    
# Question 6 :*



def est_comu(groupe, reseau):
	for i in range(len(groupe)):  # Parcours toutes les personnes dans le groupe
		for j in range(i + 1, len(groupe)):  # Compare chaque personne avec les suivantes
			personne1 = groupe[i]
			personne2 = groupe[j]
			if not sont_amis(personne1, personne2, reseau):  # Si deux personnes ne sont pas amies, retourne False
				return False
	return True  # Si toutes les personnes sont amies entre elles, retourne True  
    
    
    
    
    
 #Question 7 :



def comu(groupe, reseau):
	i = 0
	commu = [] # La communauté commence vide
	while i < len(groupe) :  #On regarde chaque personne du groupe
		personne = groupe[i]
		if sont_amis_de(personne,commu,reseau) : # si la personne est pote avec un membre
			commu.append(personne) # Alors elle peut rejoindre
		i += 1
    
	return commu  
    
    



#Question 8 :*


def tri_popu(groupe,reseau):
	grp = groupe.copy()
	i = 0
	while i < len(grp) - 1 :
		j = 0
		while j < len(grp) - i - 1 :
			if len(reseau[grp[j]]) < len(reseau[grp[j+1]]) :
				grp[j] , grp[j+1] = grp[j+1] , grp[j]
			j += 1
		i += 1
	return grp
    
    
    
    
    
#Question 9:


#on utilise le tri a bulle, mais dans le sens inverse
def comu_dans_reseau(reseau):
	i = 0
	personnes = liste_personnes(reseau)  # stockage du tableau avec toutes les personnes du reseau
	while i < len(personnes)-1 :
		j = 0
		while j < len(personnes)-i-1 :
			if len(reseau[personnes[i]]) < len(reseau[personnes[i + 1]]) : #Comparaison de leur nombre d'amis
				personnes[j] , personnes[j+1] = personnes[j+1] , personnes[j]
			j += 1
		i += 1
	tab = comu(personnes, reseau)
	return tab




# Question 10 :*



def comu_dans_amis(personne, reseau):
	amis = tri_popu(reseau[personne],reseau)
	groupe = [personne]  # Initialise le groupe avec la personne donnée
	for ami in amis:  # Parcourt les amis de cette personne
		if sont_amis_de(ami, groupe, reseau):  # Vérifie si l'ami est compatible avec le groupe
			groupe.append(ami)  # Ajoute l'ami au groupe si la condition est remplie
	return groupe  # Retourne le groupe formé
    
    
 

  
# Question 12 :*

def comu_max(reseau):
	max_comu = []  # Initialisation de la plus grande communauté trouvée
	for personne in reseau:  # Parcourt chaque personne du réseau
		comu = comu_dans_amis(personne, reseau)  # Trouve la communauté pour cette personne
		if len(comu) > len(max_comu):  # Si cette communauté est plus grande que la précédente
			max_comu = comu  # Met à jour la plus grande communauté
	return max_comu  # Retourne la plus grande communauté trouvée
   
