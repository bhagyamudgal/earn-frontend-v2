import { ChevronDownIcon, DeleteIcon } from '@chakra-ui/icons';
import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Image,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  VStack,
} from '@chakra-ui/react';
import { Dispatch, SetStateAction, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { tokenList, PrizeList, MultiSelectOptions } from '../../../constants';
import { PrizeListType } from '../../../interface/listings';
import { SponsorType } from '../../../interface/sponsor';
import { PrizeLabels } from '../../../interface/types';
import { SponsorStore } from '../../../store/sponsor';
import { createBounty, createQuestions } from '../../../utils/functions';
import { genrateuuid } from '../../../utils/helpers';
import { BountyBasicType } from './Createbounty';
import { Ques } from './questions/builder';

interface PrizeList {
  label: string;
  placeHolder: number;
}
interface Props {
  bountyBasic: BountyBasicType | undefined;
  editorData: string | undefined;
  mainSkills: MultiSelectOptions[];
  subSkills: MultiSelectOptions[];
  onOpen: () => void;
  draftLoading: boolean;
  createDraft: (payment: string) => void;
  setSlug: Dispatch<SetStateAction<string>>;
  questions: Ques[];
}
export const CreatebountyPayment = ({
  bountyBasic,
  editorData,
  mainSkills,
  subSkills,
  onOpen,
  createDraft,
  draftLoading,
  setSlug,
  questions,
}: Props) => {
  // handles which token is selected
  const [tokenIndex, setTokenIndex] = useState<number>(0);

  // stores the state for prize
  const [prizevalues, setPrizevalues] = useState<Object>({});

  // handles the UI for prize
  const [prizes, setPrizes] = useState<PrizeList[]>([
    {
      label: 'First prize',
      placeHolder: 2500,
    },
  ]);
  // sponsor
  const { currentSponsor } = SponsorStore();
  const [loading, setLoading] = useState<boolean>(false);
  const defaultQuestion: Ques[] = [
    {
      delete: false,
      id: genrateuuid(),
      label: 'Discord Username',
      question: 'Discord Username',
      type: 'text',
      options: [],
    },
    {
      delete: false,
      id: genrateuuid(),
      label: 'Tweet link',
      question: 'Tweet Link',
      type: 'text',
      options: [],
    },
    {
      delete: false,
      id: genrateuuid(),
      label: 'link',
      question: 'Application Link',
      type: 'text',
      options: [],
    },
    {
      delete: false,
      id: genrateuuid(),
      label: 'SOL Wallet',
      question: 'SOL Wallet',
      type: 'text',
      options: [],
    },
    {
      delete: false,
      id: genrateuuid(),
      label: 'Email',
      question: 'Your email address',
      type: 'text',
      options: [],
    },
    {
      delete: false,
      id: genrateuuid(),
      label: 'Twitter',
      question: 'Your Twitter Handle',
      type: 'text',
      options: [],
    },
  ];
  const onSubmit = async () => {
    setLoading(true);
    const Prizevalues = Object.values(prizevalues as Object);
    if (Prizevalues.length <= 0) {
      toast.error('Please add atleast one prize');
      return;
    }

    let amount = 0;
    let Prizes: Partial<PrizeListType> = Object();
    prizes.map((el, index) => {
      amount += Number(Prizevalues[index]);
      Prizes = {
        ...Prizes,
        [PrizeLabels[index]]: Prizevalues[index],
      };
    });
    const bountyId = genrateuuid();
    const data = await createBounty(
      {
        id: bountyId,
        active: true,
        bugBounty: false,
        deadline: bountyBasic?.deadline ?? '',
        description: JSON.stringify(editorData),
        featured: false,
        orgId: currentSponsor?.orgId ?? '',
        privateBool: false,
        title: bountyBasic?.title ?? '',
        source: 'native',
        showTop: true,
        sponsorStatus: 'Unassigned',
        prizeList: Prizes,
        amount: JSON.stringify(amount),
        skills: JSON.stringify(mainSkills),
        subSkills: JSON.stringify(subSkills),
        token: tokenList[tokenIndex as number].mintAddress,
        eligibility: bountyBasic?.eligibility ?? '',
        status: 'open',
        slug: (bountyBasic?.title.split(' ').join('-') as string) ?? '',
      },
      currentSponsor as SponsorType
    );
    const questionsRes = await createQuestions({
      id: genrateuuid(),
      bountiesId: bountyId,
      questions: JSON.stringify([...defaultQuestion, ...questions]),
    });

    if (questionsRes) {
      onOpen();
      setSlug(
        ('/bounties/' + bountyBasic?.title.split(' ').join('-')) as string
      );
      setLoading(false);
    } else {
      toast.error('Error creating bounty, please try again later.');
      setLoading(false);
    }
  };
  return (
    <>
      <VStack
        gap={2}
        pb={10}
        color={'gray.500'}
        pt={7}
        align={'start'}
        w={'2xl'}
      >
        <FormControl isRequired>
          <FormLabel color={'gray.500'}>Select Token</FormLabel>
          <Menu>
            <MenuButton
              as={Button}
              rightIcon={<ChevronDownIcon />}
              w="100%"
              h="100%"
              fontSize="1rem"
              height={'2.6rem'}
              fontWeight={500}
              color="gray.700"
              bg="transparent"
              textAlign="start"
              overflow="hidden"
              border={'1px solid #cbd5e1'}
            >
              {tokenIndex === undefined ? (
                'Select'
              ) : (
                <HStack>
                  <Image
                    w={'1.6rem'}
                    rounded={'full'}
                    src={tokenList[tokenIndex as number]?.icon}
                    alt={tokenList[tokenIndex as number]?.tokenName}
                  />
                  <Text>{tokenList[tokenIndex as number]?.tokenName}</Text>
                </HStack>
              )}
            </MenuButton>
            <MenuList
              w="40rem"
              fontSize="1rem"
              fontWeight={500}
              color="gray.600"
              maxHeight="15rem"
              overflow="scroll"
            >
              {tokenList.map((token, index) => {
                return (
                  <>
                    <MenuItem
                      key={token.mintAddress}
                      onClick={() => {
                        setTokenIndex(index);
                      }}
                    >
                      <HStack>
                        <Image
                          w={'1.6rem'}
                          rounded={'full'}
                          src={token.icon}
                          alt={token.tokenName}
                        />
                        <Text color="gray.600">{token.tokenName}</Text>
                      </HStack>
                    </MenuItem>
                  </>
                );
              })}
            </MenuList>
          </Menu>
        </FormControl>
        <VStack gap={2} mt={5} w={'full'}>
          {prizes.map((el, index) => {
            return (
              <FormControl key={el.label}>
                <FormLabel color={'gray.500'}>{el.label}</FormLabel>
                <Flex gap={3}>
                  <Input
                    type={'number'}
                    color="gray.700"
                    onChange={(e) => {
                      setPrizevalues({
                        ...(prizevalues as Object),
                        [el.label]: e.target.value,
                      });
                    }}
                    placeholder={JSON.stringify(el.placeHolder)}
                  />
                  {index === prizes.length - 1 && (
                    <Button
                      onClick={() => {
                        let temp: PrizeList[] = [];
                        prizes.map((el, index) => {
                          if (index !== prizes.length - 1) {
                            temp.push(el);
                          } else {
                            const a = prizevalues;
                          }
                        });

                        setPrizes(temp);
                      }}
                    >
                      <DeleteIcon />
                    </Button>
                  )}
                </Flex>
              </FormControl>
            );
          })}
          <Button
            isDisabled={prizes.length === 5 && true}
            bg={'transparent'}
            w="full"
            border={'1px solid #e2e8f0'}
            onClick={() => {
              setPrizes([
                ...prizes,
                {
                  label: PrizeList[prizes.length] + ' ' + 'prize',
                  placeHolder: (5 - prizes.length) * 500,
                },
              ]);
            }}
          >
            Add Prize
          </Button>
        </VStack>
        <Toaster />
        <VStack w={'full'} gap={6} mt={10}>
          <Button
            w="100%"
            bg={'#6562FF'}
            _hover={{ bg: '#6562FF' }}
            color={'white'}
            fontSize="1rem"
            fontWeight={600}
            onClick={onSubmit}
            isLoading={loading}
            disabled={loading}
          >
            Finish the Listing
          </Button>
          <Button
            w="100%"
            fontSize="1rem"
            fontWeight={600}
            color="gray.500"
            border="1px solid"
            borderColor="gray.200"
            isLoading={draftLoading}
            bg="transparent"
            onClick={() => {
              createDraft(
                JSON.stringify({
                  prizevalues,
                  token: tokenList[tokenIndex as number].mintAddress,
                })
              );
            }}
          >
            Save as Drafts
          </Button>
        </VStack>
      </VStack>
    </>
  );
};
