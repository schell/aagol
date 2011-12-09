aagol
=====
aagol is "another automaton game of life".

wtf does it do?
---------------
aagol is a system of states and rules that transition into new states based on those rules.

is it any good?
---------------
meh.

rules
-----
Users write programs and watch them transform the state of the world. It is similar to Conway's game of life. It consists of a number of parts: 

    1. The server (the world): 
        The world consists of a 2d grid of spaces in a given state.  
        States: 
            0 Empty  
            1 Block 
            2 Program 
            3 Resource  
        Rules:
            Programs can move into empty spaces
            Programs can switch places with blocks
            Programs that surround a resource on two sides turn that resource into a like program (replicate)
            Programs that have no neighboring like programs turn into empty space (die)
            Unlike programs are resources (for your programs)
            Newer programs have iteration priority
            
        The server takes care of ticking the world forward based on certain transitions the cells make. Life cells' transitions are programmable by the user.
        
    2. The client:
        Receives game state and displays it. Could possibly just receive the initial game state and transitions to cut down on data transmission.
        
    3. The language:
        Defines transitions of programs. The user defines a pre and post transition state using a char array in which each char represents a cell. 
        The user defines a 3x3 block of the world as a string of states 0-3 or X (the program being iterated over):
            000 000    
            2X0 20X 
            000 000
        This transition shows a program that is right of a like program in otherwise empty space moving to the right.
            000 000     
            0X0 X0X
            020 020
        This transition shows a program above a like program moving EITHER left OR right.
            000 XXX
            0X0 X0X
            020 X2X
        Randomly move anywhere (except to the space already occupied by a like program).
            000 000
            0X0 000
            202 2X2
        Move down in between two like programs.
            003 0X3
            0X0 000
            020 020
        Move in on a resource.