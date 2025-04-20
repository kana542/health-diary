"""
asennustesti.py
---------------
Tämä on asennustesti, joka tulostaa Pythonin, Robot Frameworkin ja
muiden käytettyjen kirjastojen versiot. Tämä tiedosto on tarkoitettu
käytettäväksi testattaessa, että kaikki tarvittavat kirjastot on asennettu.
"""

import sys
print('Python:', sys.version)

try:
    import robot
    print('Robot Framework:', robot.__version__)
except ImportError:
    print('robot-moduulia ei löydy')

try:
    import Browser
    print('Browser:', Browser.__version__)
except ImportError:
    print('Browser-moduulia ei löydy')

try:
    import requests
    print('requests:', requests.__version__)
except ImportError:
    print('RequestsLibrary- tai requests-moduulia ei löydy')

try:
    import CryptoLibrary
    print('CryptoLibrary:', CryptoLibrary.__version__)
except ImportError:
    print('CryptoLibrary-moduulia ei löydy')
