"""
This module is doing this and that...
"""
import perceval.backends.core
import sys
if __name__ == "__main__":
    from perceval.backends.core.mbox import MBox
    # This is the adress of the mailing list
    mbox_uri = 'dm@ivoa.net'
    # This is the folder when you put the .mbox files
    # First, this will be local for a speed purpose,
    # then this will be online, requesting the url where we can download the .mbox
    mbox_dir = '/home/enzo/Bureau/partage'
    compteur = 0
    # Test of the name passed in parameter
    if sys.argv[1] is None :
        print("Il faut spécifier un nom")
    else :
        # Creation of the perceval repository
        repo = MBox(uri=mbox_uri, dirpath=mbox_dir)
        # For each mail, test if the people who send the mail is corresponding to the parameter
        for message in repo.fetch():
            if sys.argv[1] in message['data']['From']:
                compteur = compteur + 1
        # print the nomber of mails sent by "Name of parameter"
        print("Nombre de messages de " + sys.argv[1] + " : " + str(compteur))

